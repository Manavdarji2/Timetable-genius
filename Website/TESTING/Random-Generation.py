import json
import random
import datetime
import copy
from datetime import datetime, timedelta

class TimetableGenerator:
    def __init__(self, data):
        self.teachers = data.get('Teacher', [])
        self.classrooms = data.get('class', [])
        self.batches = data.get('name_batch', [])
        self.num_batches = data.get('no_batch', len(self.batches))
        
        # Time settings
        self.start_time = data.get('start_time', '1:30 pm')
        self.end_time = data.get('end_time', '6:00 pm')
        self.break_start = data.get('break_start', '3:10 pm')
        self.break_end = data.get('break_end', '3:30 pm')
        
        # Hour distribution
        self.practical_hours = data.get('practical', {})
        self.theory_hours = data.get('theory', {})
        
        # Subject assignments
        self.subject_assignments = data.get('subject_assign_to_tecacher_for_which_class', {})
        
        # Subclasses
        self.subclasses = data.get('name_of_subclass', [])
        self.num_subclasses = data.get('no_of_subclass', len(self.subclasses))
        
        # Number of lectures per day
        self.num_lectures = data.get('No_of_lec', 5)
        
        # Initialize timetable structure
        self.timetable = self.initialize_timetable()
        
        # Track resource allocation
        self.teacher_schedule = {teacher: {day: {} for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]} for teacher in self.teachers}
        self.classroom_schedule = {room: {day: {} for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]} for room in self.classrooms}
        self.batch_schedule = {batch: {day: {} for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]} for batch in self.batches}

    def parse_time(self, time_str):
        """Convert time string to datetime object"""
        try:
            return datetime.strptime(time_str, "%I:%M %p")
        except ValueError:
            # Try alternative format
            return datetime.strptime(time_str, "%H:%M")
    
    def format_time(self, dt):
        """Format datetime to time string"""
        return dt.strftime("%I:%M %p").lstrip("0").replace(" 0", " ")
    
    def get_time_slots(self):
        """Generate time slots based on start time, end time, and breaks"""
        start = self.parse_time(self.start_time)
        end = self.parse_time(self.end_time)
        break_start = self.parse_time(self.break_start)
        break_end = self.parse_time(self.break_end)
        
        # Calculate lecture duration based on number of lectures and available time
        total_minutes = ((end.hour * 60 + end.minute) - (start.hour * 60 + start.minute)) - \
                        ((break_end.hour * 60 + break_end.minute) - (break_start.hour * 60 + break_start.minute))
        
        lecture_duration = total_minutes // self.num_lectures
        
        slots = []
        current = start
        
        while current < end:
            slot_end = current + timedelta(minutes=lecture_duration)
            
            # Check if slot overlaps with break time
            if (current <= break_start < slot_end) or (current < break_end <= slot_end) or \
               (break_start <= current < break_end):
                # Skip to after break
                current = break_end
                continue
            
            if slot_end > end:
                slot_end = end
                
            slots.append({
                'start': self.format_time(current),
                'end': self.format_time(slot_end)
            })
            
            current = slot_end
            
            if len(slots) >= self.num_lectures:
                break
        
        return slots
    
    def initialize_timetable(self):
        """Create the initial empty timetable structure"""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        time_slots = self.get_time_slots()
        
        timetable = {
            day: {
                slot_idx: {
                    batch: {
                        'subject': None,
                        'teacher': None,
                        'room': None,
                        'type': None  # 'theory' or 'practical'
                    } for batch in self.batches
                } for slot_idx, slot in enumerate(time_slots)
            } for day in days
        }
        
        return timetable
    
    def is_resource_available(self, day, slot_idx, teacher, classroom, batch):
        """Check if resources are available for the given slot"""
        if teacher in self.teacher_schedule[teacher][day].get(slot_idx, []):
            return False
        
        if classroom in self.classroom_schedule[classroom][day].get(slot_idx, []):
            return False
        
        if batch in self.batch_schedule[batch][day].get(slot_idx, []):
            return False
        
        return True
    
    def allocate_resources(self, day, slot_idx, teacher, classroom, batch, subject, session_type):
        """Mark resources as allocated for this slot"""
        # Initialize slot dictionary if not exists
        if slot_idx not in self.teacher_schedule[teacher][day]:
            self.teacher_schedule[teacher][day][slot_idx] = []
        if slot_idx not in self.classroom_schedule[classroom][day]:
            self.classroom_schedule[classroom][day][slot_idx] = []
        if slot_idx not in self.batch_schedule[batch][day]:
            self.batch_schedule[batch][day][slot_idx] = []
        
        # Mark resources as used
        self.teacher_schedule[teacher][day][slot_idx].append(batch)
        self.classroom_schedule[classroom][day][slot_idx].append(batch)
        self.batch_schedule[batch][day][slot_idx].append({
            'teacher': teacher,
            'room': classroom,
            'subject': subject,
            'type': session_type
        })
        
        # Update timetable
        self.timetable[day][slot_idx][batch] = {
            'subject': subject,
            'teacher': teacher,
            'room': classroom,
            'type': session_type
        }
    
    def allocate_sessions(self):
        """Allocate all sessions to the timetable"""
        # First, allocate practical sessions (they typically need more constraints)
        self.allocate_session_type('practical')
        
        # Then, allocate theory sessions
        self.allocate_session_type('theory')
    
    def allocate_session_type(self, session_type):
        """Allocate either practical or theory sessions"""
        hours_data = self.practical_hours if session_type == 'practical' else self.theory_hours
        days = list(self.timetable.keys())
        
        # For each batch and subject
        for batch in self.batches:
            for subject, hours in hours_data.get(batch, {}).items():
                hours_remaining = int(hours)
                
                # Get eligible teachers for this subject
                eligible_teachers = []
                for teacher, subjects in self.subject_assignments.items():
                    if subject in subjects:
                        eligible_teachers.append(teacher)
                
                if not eligible_teachers:
                    print(f"Warning: No teachers assigned for {subject}")
                    continue
                
                # Allocate each required hour
                while hours_remaining > 0:
                    # Try to find an available slot
                    allocated = False
                    
                    # Shuffle days and slots for random distribution
                    random.shuffle(days)
                    for day in days:
                        slots = list(self.timetable[day].keys())
                        random.shuffle(slots)
                        
                        for slot_idx in slots:
                            # Check if this batch is already occupied in this slot
                            if self.timetable[day][slot_idx][batch]['subject'] is not None:
                                continue
                                
                            # Try each eligible teacher
                            random.shuffle(eligible_teachers)
                            for teacher in eligible_teachers:
                                # Try each available classroom
                                available_rooms = list(self.classrooms)
                                random.shuffle(available_rooms)
                                
                                for room in available_rooms:
                                    # Check if resources are available
                                    if self.is_resource_available(day, slot_idx, teacher, room, batch):
                                        # Allocate resources
                                        self.allocate_resources(day, slot_idx, teacher, room, batch, subject, session_type)
                                        hours_remaining -= 1
                                        allocated = True
                                        break
                                        
                                if allocated:
                                    break
                                    
                            if allocated or hours_remaining <= 0:
                                break
                                
                        if allocated or hours_remaining <= 0:
                            break
                    
                    # If we couldn't allocate a slot after trying all possibilities
                    if not allocated:
                        print(f"Warning: Could not allocate all sessions for {subject} ({session_type}) for batch {batch}. {hours_remaining} hours remaining.")
                        break
    
    def generate_timetable(self):
        """Main method to generate the timetable"""
        self.allocate_sessions()
        return self.timetable
    
    def print_timetable(self):
        """Print the generated timetable in a readable format"""
        time_slots = self.get_time_slots()
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        
        for batch in self.batches:
            print(f"\n{'='*80}")
            print(f"TIMETABLE FOR BATCH: {batch}")
            print(f"{'='*80}")
            
            # Print header with time slots
            header = "| Day       |"
            for i, slot in enumerate(time_slots):
                header += f" {slot['start']}-{slot['end']} |"
            print(header)
            print("|" + "-"*(len(header)-2) + "|")
            
            # Print timetable rows
            for day in days:
                row = f"| {day:<10}|"
                
                for slot_idx in range(len(time_slots)):
                    cell = self.timetable[day].get(slot_idx, {}).get(batch, {})
                    
                    if cell and cell['subject']:
                        subject = cell['subject']
                        teacher = cell['teacher']
                        room = cell['room']
                        session_type = cell['type']
                        
                        # Abbreviate if too long
                        if len(subject) > 10:
                            subject = subject[:8] + ".."
                        
                        info = f"{subject}\n{teacher}\n{room}\n({session_type})"
                        row += f" {info:<21}|"
                    else:
                        row += " " + " "*20 + "|"
                
                print(row)
            
            print(f"{'='*80}")
    
    def export_json(self):
        """Export the timetable to JSON format"""
        time_slots = self.get_time_slots()
        result = {
            "metadata": {
                "start_time": self.start_time,
                "end_time": self.end_time,
                "break_start": self.break_start,
                "break_end": self.break_end,
                "time_slots": time_slots,
                "num_batches": self.num_batches,
                "num_lectures": self.num_lectures
            },
            "timetable": {}
        }
        
        # Format the timetable for each batch
        for batch in self.batches:
            result["timetable"][batch] = {}
            
            for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]:
                result["timetable"][batch][day] = []
                
                for slot_idx in range(len(time_slots)):
                    cell = self.timetable[day].get(slot_idx, {}).get(batch, {})
                    slot_info = {
                        "time": f"{time_slots[slot_idx]['start']} - {time_slots[slot_idx]['end']}",
                        "subject": cell.get('subject'),
                        "teacher": cell.get('teacher'),
                        "room": cell.get('room'),
                        "type": cell.get('type')
                    }
                    result["timetable"][batch][day].append(slot_info)
        
        return result


def main():
    # Sample input data (replace with actual data from file or API)
    input_data = {
        "Teacher": ["Mr. Smith", "Ms. Johnson", "Dr. Brown", "Prof. Wilson"],
        "class": ["Room 101", "Room 102", "Lab A", "Lab B"],
        "name_batch": ["CSE-A", "CSE-B", "IT-A"],
        "start_time": "9:00 am",
        "end_time": "4:00 pm",
        "break_start": "12:00 pm",
        "break_end": "1:00 pm",
        "practical": {
            "CSE-A": {"Data Structures": 4, "Computer Networks": 4},
            "CSE-B": {"Database Systems": 4, "Operating Systems": 4},
            "IT-A": {"Web Development": 4, "Software Engineering": 4}
        },
        "theory": {
            "CSE-A": {"Data Structures": 3, "Computer Networks": 3, "Mathematics": 2},
            "CSE-B": {"Database Systems": 3, "Operating Systems": 3, "Discrete Math": 2},
            "IT-A": {"Web Development": 3, "Software Engineering": 3, "Professional Ethics": 2}
        },
        "subject_assign_to_tecacher_for_which_class": {
            "Mr. Smith": ["Data Structures", "Operating Systems"],
            "Ms. Johnson": ["Computer Networks", "Web Development"],
            "Dr. Brown": ["Mathematics", "Discrete Math", "Database Systems"],
            "Prof. Wilson": ["Software Engineering", "Professional Ethics"]
        },
        "name_of_subclass": ["Theory", "Lab"],
        "No_of_lec": 6
    }
    
    # If you have JSON file input, uncomment and use this code:
    """
    import sys
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as file:
            input_data = json.load(file)
    """
    
    # Generate the timetable
    generator = TimetableGenerator(input_data)
    timetable = generator.generate_timetable()
    
    # Print the timetable in console-friendly format
    generator.print_timetable()
    
    # Export the timetable to JSON
    json_output = generator.export_json()
    
    # Save the JSON output to a file
    with open("timetable.json", "w") as outfile:
        json.dump(json_output, outfile, indent=2)
    print("\nTimetable has been exported to 'timetable.json'")


if __name__ == "__main__":
    main()