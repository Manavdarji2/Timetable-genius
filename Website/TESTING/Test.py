import base64
import os
from google import genai
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

def generate(Input_ans):
    model=genai.GenerativeModel('gemini-1.5-flash-latest')
    few_shot_promot=f"""
    You are a specialized timetable generation assistant for educational institutions. Your task is to create comprehensive, conflict-free timetables based on the provided inputs. Follow these guidelines strictly:

    1. Generate a timetable that avoids any time clashes for teachers, classes, or classrooms
    2. Respect break times and scheduling constraints
    3. Balance the distribution of subjects throughout the week
    4. Output the timetable in JSON format suitable for pandas DataFrame processing
    5. Group data by subclass, batch, and day of week
    6. Include classroom assignments for each session
    7. Handle both theory and practical sessions appropriately
    8. Maintain subject distributions according to the specified hours per week

    Return ONLY the formatted timetable in JSON without any additional text explanations.
    """+"""
    input:-
    Teacher=['Nirbhay Sir', "Ankit Sir", "Sufiyan Sir", "Seher Ma'am", "Kanisk Sir", "Anusha Ma'am", "Rahid Sir"]
    class={
        'class1': {'batch1': ['A', 'B', 'C', 'D', 'E'], 'batch2': ['F', 'G', 'H', 'I', 'J']},
        'class2': {'batch1': ['K', 'L', 'M', 'N', 'O'], 'batch2': ['P', 'Q', 'R', 'S', 'T']},
        'class3': {'batch1': ['U', 'V', 'W', 'X', 'Y'], 'batch2': ['Z', 'AA', 'AB', 'AC', 'AD']},
    }
    classroom_no={
        'class1': 1,
        'class2': 2,
        'class3': 3,
    }
    name_batch = ["FY", "SY", "TY"]
    start_time = "1:30 pm"
    end_time = "6:00 pm"
    break_start='3:10 pm'
    break_end='3:30 pm'
    No_of_lec=5
    no_of_subclass=2
    name_of_subclass=["AIML",'CTIS']
    subject_assign_to_tecacher_for_which_class={
        "Nirbhay Sir": {
            "AIML":{
                "FY": ["Python"], 
                "SY": ["Machin Learning", "Data Visualisation"],
                "TY":["Deep Learning"]
            },
            "CTIS":dict()
        },
        "Ankit Sir": {
            "AIML":{
                "FY": ["Data Science"],
                "SY": ["Python"],
                "TY":["Data Science"]
            },
            "CTIS":dict(), 
        },
        "Sufiyan Sir": {
            "AIML":{
                "FY": ["Data Science"],
                "SY": ["Data Science"],
                "TY":["Data Science"]
            },
            "CTIS":dict(),              
        }
    }
    no_batch=3
    theory={
        "Nirbhay Sir": {
            "AIML":{
                "FY": 2,
                "SY": 2,
                "TY": 1
                },
            "CTIS":dict()
            },
        "Ankit Sir": {
            "AIML":{
                "FY": 1,
                "SY": 2,
                "TY": 1
                },
            "CTIS":dict(),
        },
        "Sufiay Sir": {
            "AIML":{
                "FY": 1,
                "SY": 1,
                "TY": 1
                },
            "CTIS":dict(),
            }
    }
    practical={
        "Nirbhay Sir": {
            "AIML":{
                "FY": 2,
                "SY": 2,
                "TY": 1
                },
            "CTIS":dict(),
            },
        "Ankit Sir": {
            "AIML":{
                "FY": 1,
                "SY": 2,
                "TY": 1
                },
            "CTIS":dict(),
            },
        "Sufiyan Sir": {
            "AIML":{
                "FY": 1,
                "SY": 1,
                "TY": 1
                },
            "CTIS":dict(),
            }
        }

    Output:- 
    {
    'AIML': {
        'FY': {
            'Monday': {
                '1:30pm to 2:20pm': {'subject': 'Python (Nirbhay Sir)', 'classroom': 'Room 101', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Data Science (Ankit Sir)', 'classroom': 'Room 101', 'type': 'Theory'},
                '3:30pm to 4:20pm': {'subject': 'Python Lab (Nirbhay Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
                '4:20pm to 5:10pm': {'subject': 'Data Science Lab (Sufiyan Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
            },
            'Tuesday': {
                '1:30pm to 2:20pm': {'subject': 'Python (Nirbhay Sir)', 'classroom': 'Room 101', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Data Science (Sufiyan Sir)', 'classroom': 'Room 101', 'type': 'Theory'},
                '3:30pm to 4:20pm': {'subject': 'Data Science Lab (Ankit Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
                '4:20pm to 5:10pm': {'subject': 'Python Lab (Nirbhay Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
            },
            'Wednesday': {
                '1:30pm to 2:20pm': {'subject': 'Data Science (Ankit Sir)', 'classroom': 'Room 101', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Python Lab (Nirbhay Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
                '3:30pm to 4:20pm': {'subject': 'Data Science Lab (Sufiyan Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
            },
            'Thursday': {
                '1:30pm to 2:20pm': {'subject': 'Data Science (Sufiyan Sir)', 'classroom': 'Room 101', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Python Lab (Nirbhay Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
            },
            'Friday': {
                '1:30pm to 2:20pm': {'subject': 'Python Lab (Nirbhay Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Science Lab (Ankit Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
            },
            'Saturday': {
                '1:30pm to 2:20pm': {'subject': 'Python Lab (Nirbhay Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Science Lab (Sufiyan Sir)', 'classroom': 'Lab 201', 'type': 'Practical'},
            }
        },
        'SY': {
            'Monday': {
                '1:30pm to 2:20pm': {'subject': 'Machin Learning (Nirbhay Sir)', 'classroom': 'Room 102', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Data Visualisation (Nirbhay Sir)', 'classroom': 'Room 102', 'type': 'Theory'},
                '3:30pm to 4:20pm': {'subject': 'Python (Ankit Sir)', 'classroom': 'Room 102', 'type': 'Theory'},
                '4:20pm to 5:10pm': {'subject': 'Data Science (Sufiyan Sir)', 'classroom': 'Room 102', 'type': 'Theory'},
            },
            'Tuesday': {
                '1:30pm to 2:20pm': {'subject': 'Machin Learning Lab (Nirbhay Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Visualisation Lab (Nirbhay Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
                '3:30pm to 4:20pm': {'subject': 'Python Lab (Ankit Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
                '4:20pm to 5:10pm': {'subject': 'Data Science Lab (Sufiyan Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
            },
            'Wednesday': {
                '1:30pm to 2:20pm': {'subject': 'Python (Ankit Sir)', 'classroom': 'Room 102', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Machin Learning Lab (Nirbhay Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
                '3:30pm to 4:20pm': {'subject': 'Data Visualisation Lab (Nirbhay Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
            },
            'Thursday': {
                '1:30pm to 2:20pm': {'subject': 'Data Science (Sufiyan Sir)', 'classroom': 'Room 102', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Python Lab (Ankit Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
            },
            'Friday': {
                '1:30pm to 2:20pm': {'subject': 'Machin Learning Lab (Nirbhay Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Visualisation Lab (Nirbhay Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
            },
            'Saturday': {
                '1:30pm to 2:20pm': {'subject': 'Python Lab (Ankit Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Science Lab (Sufiyan Sir)', 'classroom': 'Lab 202', 'type': 'Practical'},
            }
        },
        'TY': {
            'Monday': {
                '1:30pm to 2:20pm': {'subject': 'Deep Learning (Nirbhay Sir)', 'classroom': 'Room 103', 'type': 'Theory'},
                '2:20pm to 3:10pm': {'subject': 'Data Science (Ankit Sir)', 'classroom': 'Room 103', 'type': 'Theory'},
                '3:30pm to 4:20pm': {'subject': 'Data Science (Sufiyan Sir)', 'classroom': 'Room 103', 'type': 'Theory'},
            },
            'Tuesday': {
                '1:30pm to 2:20pm': {'subject': 'Deep Learning Lab (Nirbhay Sir)', 'classroom': 'Lab 203', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Science Lab (Ankit Sir)', 'classroom': 'Lab 203', 'type': 'Practical'},
                '3:30pm to 4:20pm': {'subject': 'Data Science Lab (Sufiyan Sir)', 'classroom': 'Lab 203', 'type': 'Practical'},
            },
            'Wednesday': {
                '1:30pm to 2:20pm': {'subject': 'Deep Learning Lab (Nirbhay Sir)', 'classroom': 'Lab 203', 'type': 'Practical'},
                '2:20pm to 3:10pm': {'subject': 'Data Science Lab (Ankit Sir)', 'classroom': 'Lab 203', 'type': 'Practical'},
            },
            'Thursday': {
                '1:30pm to 2:20pm': {'subject': 'Data Science (Ankit Sir)', 'classroom': 'Room 103', 'type': 'Theory'},
            },
            'Friday': {
                '1:30pm to 2:20pm': {'subject': 'Data Science (Sufiyan Sir)', 'classroom': 'Room 103', 'type': 'Theory'},
            },
            'Saturday': {}
        }
    },
    'CTIS': {
        'FY': {},
        'SY': {},
        'TY': {}
    }
    }
    """
    
    timetable = model.generate_content([few_shot_promot, Input_ans])
    return timetable.text
# teacher, subjects, classrooms, classes, timetable_name, timetable_description, start_date, end_date, start_time, end_time, lecture_duration, break_duration, classes_inc, break_start, prioritize_teacher_preferences, max_consecutive_lec, class_per_day, allow_gaps

def generate_timetable(teacher_list, classrooms, batches, time_slots, subjects_data, theory_hours, practical_hours, subclasses=None, break_times=None):
    
    
    
    # Prepare input for the Gemini model
    input_data = f"""
    Teacher={teacher_list},
    class={classrooms},
    name_batch={batches},
    start_time="{time_slots.get('start_time', '1:30 pm')}",
    end_time="{time_slots.get('end_time', '6:00 pm')}",
    break_start="{break_times.get('break_start', '3:10 pm')}",
    break_end="{break_times.get('break_end', '3:30 pm')}",
    practical={practical_hours},
    theory={theory_hours},
    no_batch={len(batches)},
    subject_assign_to_tecacher_for_which_class={subjects_data},
    name_of_subclass={subclasses},
    No_of_lec={time_slots.get('no_of_lec', 5)},
    no_of_subclass={len(subclasses)}
    Generate a comprehensive timetable that:
    1. Allocates classrooms efficiently for theory and practical sessions
    2. Prevents teacher scheduling conflicts
    3. Balances subject distribution across the week
    4. Respects break times
    5. Creates an optimal learning schedule
    
    Format the timetable as a JSON object that can be loaded directly into a pandas DataFrame,
    with classroom assignments clearly specified for each session.
    """
    
    return generate(input_data)


# Example usage
Teacher=['Nirbhay Sir', "Ankit Sir", "Sufiyan Sir", "Seher Ma'am", "Kanisk Sir", "Anusha Ma'am", "Rahid Sir"]
classroom_data = {
    'class1': {'number': 101, 'type': 'Theory', 'capacity': 60},
    'class2': {'number': 102, 'type': 'Theory', 'capacity': 60},
    'class3': {'number': 103, 'type': 'Theory', 'capacity': 60},
    'lab1': {'number': 201, 'type': 'Lab', 'capacity': 40},
    'lab2': {'number': 202, 'type': 'Lab', 'capacity': 40},
    'lab3': {'number': 203, 'type': 'Lab', 'capacity': 40}
}
name_batch = ["FY", "SY", "TY"]
time_slots = {
    "start_time": "1:30 pm",
    "end_time": "6:00 pm",
    "no_of_lec": 5
}
break_times = {
    'break_start': '3:10 pm',
    'break_end': '3:30 pm'
}
name_of_subclass = ["AIML", 'CTIS']

subject_assign_to_tecacher_for_which_class = {
    "Nirbhay Sir": {
        "AIML":{
            "FY": ["Python"], 
            "SY": ["Machine Learning", "Data Visualisation"],
            "TY":["Deep Learning"]
        },
        "CTIS": {}
    },
    "Ankit Sir": {
        "AIML":{
            "FY": ["Data Science"],
            "SY": ["Python"],
            "TY":["Data Science"]
        },
        "CTIS": {},
    },
    "Sufiyan Sir": {
        "AIML":{
            "FY": ["Data Science"],
            "SY": ["Data Science"],
            "TY":["Data Science"]
        },
        "CTIS": {},              
    }
}

theory = {
    "Nirbhay Sir": {
        "AIML":{
            "FY": 2,
            "SY": 2,
            "TY": 1
        },
        "CTIS": {}
    },
    "Ankit Sir": {
        "AIML":{
            "FY": 1,
            "SY": 2,
            "TY": 1
        },
        "CTIS": {},
    },
    "Sufiyan Sir": {
        "AIML":{
            "FY": 1,
            "SY": 1,
            "TY": 1
        },
        "CTIS": {},
    }
}

practical = {
    "Nirbhay Sir": {
        "AIML":{
            "FY": 2,
            "SY": 2,
            "TY": 1
        },
        "CTIS": {},
    },
    "Ankit Sir": {
        "AIML":{
            "FY": 1,
            "SY": 2,
            "TY": 1
        },
        "CTIS": {},
    },
    "Sufiyan Sir": {
        "AIML":{
            "FY": 1,
            "SY": 1,
            "TY": 1
        },
        "CTIS": {},
    }
}

# Generate timetable with enhanced parameters
timetable = generate_timetable(
    teacher_list=Teacher,
    classrooms=classroom_data,
    batches=name_batch,
    time_slots=time_slots,
    subjects_data=subject_assign_to_tecacher_for_which_class,
    theory_hours=theory,
    practical_hours=practical,
    subclasses=name_of_subclass,
    break_times=break_times
)

# print(timetable)

# If you want to convert to DataFrame
import pandas as pd
import json
# it is in markdown code code convert to json
timetable= timetable.replace("```json", "").replace("```", "")

# create a json file and read after that and generate a excel

with open('timetable.json', 'w') as f:
    f.write(timetable)

# open the json file and read it
# in dataframe format

# take first value of that and make a format in json
with open('timetable.json', 'r') as f:
    data = json.load(f)

    