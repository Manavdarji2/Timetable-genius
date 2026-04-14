// TimeTableGenius Main Script

document.addEventListener('DOMContentLoaded', () => {

    const initNavigation = () => {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const pages = document.querySelectorAll('.page');

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all sidebar items
                sidebarItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');

                // Get target page
                const targetPage = item.getAttribute('data-page');

                // Hide all pages
                pages.forEach(page => page.style.display = 'none');

                // Show target page
                document.getElementById(targetPage).style.display = 'block';
            });
        });
    };
        // ...existing code...
    
    // ── Profile: fetch, render and wire edit modal ────────────────────────────
    const initProfileStats = async () => {
        // Helper: populate all read-only display fields from the stats object
        const renderProfileDisplay = (stats) => {
            const setEl = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val || 'N/A';
            };
            setEl('full-name', stats.name);
            setEl('profile-name', stats.name);
            setEl('email', stats.email);
            setEl('phone', stats.phone ?? null);
            setEl('dob', stats.dob ?? null);
            setEl('department', stats.department ?? null);
            setEl('employee-id', stats.employee_id ?? null);
            setEl('profile-role',
                stats.role === 'admin' ? 'Administrator'
                : stats.role === 'teacher' ? 'Teacher'
                : stats.role ?? 'N/A'
            );
            const joinedEl = document.getElementById('join-date');
            if (joinedEl && stats.joined) {
                joinedEl.textContent = new Date(stats.joined).toLocaleDateString();
            }
        };

        // Helper: populate edit-modal inputs from stats
        const populateEditModal = (stats) => {
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val ?? '';
            };
            setVal('edit-full-name', stats.name);
            setVal('edit-email', stats.email);
            setVal('edit-phone', stats.phone);
            setVal('edit-dob', stats.dob);
            const deptEl = document.getElementById('edit-department');
            if (deptEl && stats.department) {
                Array.from(deptEl.options).forEach(o => {
                    o.selected = o.value === stats.department || o.text === stats.department;
                });
            }
        };

        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const stats = data.stats;

            renderProfileDisplay(stats);
            populateEditModal(stats);

            // ── Wire Edit Profile button ──────────────────────────────────────
            const editProfileBtn = document.getElementById('edit-profile-btn');
            const editModal = document.getElementById('edit-profile-modal');
            if (editProfileBtn && editModal) {
                // Ensure the modal is fresh each open
                editProfileBtn.onclick = () => {
                    populateEditModal(stats);
                    editModal.style.display = 'flex';
                };

                // Close handlers
                editModal.querySelector('.close-btn').onclick = () => {
                    editModal.style.display = 'none';
                };
                const cancelBtn = editModal.querySelector('.btn-secondary');
                if (cancelBtn) cancelBtn.onclick = () => { editModal.style.display = 'none'; };

                // Save handler
                const saveBtn = editModal.querySelector('.btn-primary');
                if (saveBtn) {
                    saveBtn.onclick = async () => {
                        const name = document.getElementById('edit-full-name').value.trim();
                        const email = document.getElementById('edit-email').value.trim();
                        if (!name || !email) {
                            showToast('Name and email are required.', 'error');
                            return;
                        }
                        try {
                            saveBtn.disabled = true;
                            saveBtn.textContent = 'Saving…';
                            const res = await fetch('/api/profile', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ name, email })
                            });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.error || 'Failed to update profile');

                            // Update local stats and re-render display fields
                            stats.name = name;
                            stats.email = email;
                            renderProfileDisplay(stats);

                            editModal.style.display = 'none';
                            showToast('Profile updated successfully!', 'success');
                        } catch (err) {
                            showToast(`Error: ${err.message}`, 'error');
                        } finally {
                            saveBtn.disabled = false;
                            saveBtn.textContent = 'Save Changes';
                        }
                    };
                }
            }

            // ── Change Password button ─────────────────────────────────────────
            const changePwBtn = document.getElementById('change-password-btn');
            if (changePwBtn) {
                changePwBtn.onclick = () => openModal('Change Password', 'change-password-form');
            }

        } catch (error) {
            console.error('Failed to fetch profile:', error);
            showToast('Failed to load profile data', 'error');
        }
    };
    
    const initDashboardStats = async () => {
    try {
        // Fetch dashboard stats from backend
        const response = await fetch('/dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // This is important for session cookies
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();

        // Update stats in the UI
        document.getElementById('teacher-count').textContent = data.stats.teachers || 0;
        document.getElementById('class-count').textContent = data.stats.classes || 0;
        document.getElementById('classroom-count').textContent = data.stats.classrooms || 0;
        document.getElementById('subject-count').textContent = data.stats.subjects || 0;

        // Update user name if provided
        if (data.user_name) {
            document.getElementById('user-name').textContent = data.user_name;
        }
        const DynamicList = document.getElementById("activity-list");

        const getRelativeTime = (timestamp) => {
            const now = new Date();
            const activityTime = new Date(timestamp);
            const diffInSeconds = Math.floor((now - activityTime) / 1000);

            if (diffInSeconds < 60) {
                return `${diffInSeconds} seconds ago`;
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} hour${hours > 1 ? "s" : ""} ago`;
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} day${days > 1 ? "s" : ""} ago`;
            }
        };
        // Render activities
        data.activities.forEach(activity => {
            const li = document.createElement("li");
            
            // Remove "GMT" and convert the timestamp to a Date object
            const timestampWithoutGMT = activity.timestamp.replace(" GMT", "");
            const relativeTime = getRelativeTime(timestampWithoutGMT);
            
            // Insert relative time and details
            li.innerHTML = `<span class="activity-time">${relativeTime}</span> ${activity.description }`;
            DynamicList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showErrorAlert('Failed to load dashboard statistics');
    }
};

    // Dashboard Actions Handler
    const initDashboardActions = () => {
        const actionCards = document.querySelectorAll('.action-card');
        
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const targetPage = card.getAttribute('data-page') + '-page';
                const targetSidebarItem = document.querySelector(`.sidebar-item[data-page="${targetPage}"]`);
                
                if (targetSidebarItem) {
                    targetSidebarItem.click();
                }
            });
        });
    };
    // Teacher Management
    const initTeacherManagement = async () => {
        const addTeacherBtn = document.getElementById('add-teacher-btn');
        const teacherSearch = document.getElementById('teacher-search');
        const departmentFilter = document.getElementById('teacher-department-filter');
        const teacherTableBody = document.getElementById('teacher-table');
    
        // Clear existing rows before populating
        teacherTableBody.innerHTML = '';
    
        addTeacherBtn.addEventListener('click', () => openModal('Add Teacher', 'teacher-form'));
        
        teacherSearch.addEventListener('input', filterTeachers);
        departmentFilter.addEventListener('change', filterTeachers);
    
        // Fetch data from flask mysql server
        try {
            const response = await fetch('/api/teachers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch teachers');
            }
    
            const teachers = await response.json();
            // Populate teacher table
            teachers.forEach((teacher) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <tr>
                    <td>${teacher.teacher_name || 'N/A'}</td>
                    <td>${teacher.email || 'N/A'} <br> ${teacher.phone || 'N/A'}</td>
                    <td>${teacher.department_name || 'N/A'}</td>
                    <td>${teacher.subjects || 'No subjects'}</td>
                    <td>${teacher.weekly_hours || 'N/A'}</td>
                    <td>
                        <div class="teacher-actions">
                            <button class="btn btn-primary btn-sm" onclick="EditTeacherDetails(${teacher.teacher_id})">
                                Edit
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="DeleteTeacherData(${teacher.teacher_id})">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
                `;
                teacherTableBody.appendChild(row);
            });
            // Populate department filter
            const uniqueDepartments = [...new Set(teachers.map(t => t.department_name))];
            departmentFilter.innerHTML = `
                <option value="">All Departments</option>
                ${uniqueDepartments.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
            `;
    
        } catch(error) {
            console.error('Error fetching teachers:', error);
            // Show error message to user
            teacherTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Failed to load teachers. Please try again later.
                    </td>
                </tr>
            `;
        }
        // Edit Teacher Details
        window.DeleteTeacherData = async (teacherId) => {
            try {
                const response = await fetch(`/api/teachers/${teacherId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },

                });
                if (!response.ok) {
                    throw new Error('Failed to delete teacher');
                }
                
                // Show success message
                showSuccessAlert('Teacher deleted successfully!');
            } catch (error) {
                console.error('Error deleting teacher:', error);
                // Show error message to user
                showToast('Failed to delete teacher. Please try again later.', 'error');
            }finally{
                window.location.reload();
            }
        };
        
        window.EditTeacherDetails = async (teacherId) => {
            const response = await fetch(`/api/teachers/${teacherId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const teacher = await response.json();
            // Update teacher details in the UI
            openModal('Edit Teacher', 'edit-teacher-form',teacher,null, teacherId);
        };
        // Teacher Actions Functionality
    
        function filterTeachers() {
            const searchTerm = teacherSearch.value.toLowerCase();
            const department = departmentFilter.value.toLowerCase();
            const rows = teacherTableBody.querySelectorAll('tr');
    
            rows.forEach(row => {
                // Skip the error message row if it exists
                if (row.cells.length === 1) return;
    
                const nameCell = row.cells[0].textContent.toLowerCase();
                const deptCell = row.cells[2].textContent.toLowerCase();
                
                const nameMatch = nameCell.includes(searchTerm);
                const deptMatch = department === '' || deptCell === department;
    
                row.style.display = (nameMatch && deptMatch) ? '' : 'none';
            });
        }
    };
    // Student Management
    const initSubjectsManagement = async () => {
        const addSubjectsBtn = document.getElementById('add-subject-btn');
        const subjectSearch = document.getElementById('subject-search');
        const departmentFilter = document.getElementById('subject-department-filter');
        const subjectTableBody = document.getElementById('subject-table-body');
        let departments = {};
        let teachers = {};
        let dataCombine = {};
        let allSubjects = [];
        
        try {
            const response1 = await fetch('/api/departments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            departments = await response1.json();
    
            const response2 = await fetch('/api/teachers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            teachers = await response2.json();
            
            // Combine the two values into one object
            dataCombine = {
                departments: departments,
                teachers: teachers
            };
            
            // Populate department filter dropdown
            departmentFilter.innerHTML = '<option value="">All Departments</option>';
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.name;
                option.textContent = dept.name;
                departmentFilter.appendChild(option);
            });
            addSubjectsBtn.addEventListener('click', () => openModal('Add Subject', 'subject-form', null, dataCombine, NaN));
        
        } catch (error) {
            console.log('Error fetching data:', error);
        }
        try {
            const response = await fetch('/api/subjects', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            allSubjects = await response.json();
            
            renderSubjectsTable(allSubjects);
            
            // Set up the event listeners for filtering
            subjectSearch.addEventListener('input', filterSubjects);
            departmentFilter.addEventListener('change', filterSubjects);
            
        } catch (error) {
            console.log('Error fetching subjects data:', error);
        }
        // Function to render the subjects table
        function renderSubjectsTable(subjects) {
            subjectTableBody.innerHTML = '';
            subjects.forEach((subject) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${subject.name}</td>
                    <td>${subject.department_name}</td>
                    <td>${subject.type}</td>
                    <td>${subject.weekly_hours}</td>
                    <td>${subject.teacher_name || 'Not Assigned'}</td>
                    <td>
                        <div class="teacher-actions">
                            <button class="btn btn-primary btn-sm" onclick="EditSubjectDetails(${subject.subject_id})">
                                Edit
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="DeleteSubjectData(${subject.subject_id})">
                                Delete
                            </button>
                        </div>
                    </td>
                `;
                subjectTableBody.appendChild(row);
            });
        }
        // Edit subject details
        window.EditSubjectDetails=async (subject_id)=>{
            try {
                const response = await fetch(`/api/subjects/${subject_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                const subject = await response.json();

                openModal("Edit Subject", 'edit-subject-form', data=subject, option_data=dataCombine, updated_id=subject_id)
            }catch(error){
                console.log('Error fetching subject data:', error);
            }

        }
        window.DeleteSubjectData = async (subject_id) => {
            try {
                // Show alert if user wants to delete the data
                if(!confirm('Are you sure you want to delete this subject?')) return;
                
                const response = await fetch(`/api/subjects/${subject_id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                const data = await response.json();
                
                if(response.ok) {
                    console.log('Subject deleted successfully');
                    // Refresh the page or update the UI to reflect the deletion
                    // For example: remove the subject from the DOM
                    const subjectElement = document.getElementById(`subject-${subject_id}`);
                    if (subjectElement) {
                        subjectElement.remove();
                    } else {
                        // If you can't find a specific element to remove, just reload the page
                        location.reload();
                    }
                    // Optionally show a success message to the user
                    showToast('Subject deleted successfully', 'success');
                } else {
                    // Handle error responses
                    console.error('Error:', data.error);
                    showToast(`Failed to delete subject: ${data.error}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
                showToast('An unexpected error occurred while deleting the subject', 'error');
            }finally{
                window.location.reload()
            }
        };
        // Filter function for subjects
        function filterSubjects() {
            const searchTerm = subjectSearch.value.toLowerCase();
            const department = departmentFilter.value;
            
            const filteredSubjects = allSubjects.filter(subject => {
                const nameMatch = subject.name.toLowerCase().includes(searchTerm);
                const deptMatch = department === '' || subject.department_name === department;
                
                return nameMatch && deptMatch;
            });
            
            renderSubjectsTable(filteredSubjects);
        }
    };
    const initClassesManagement = async () => {
        const addClassesBtn = document.getElementById('add-class-btn');
        const ClassesSearch = document.getElementById('class-search');
        const classesTable = document.getElementById('classes-table-rows');
        const classesFilter = document.getElementById('class-grade-filter');
    
        let allClasses = [];
        let subjectDict = [];
    
        ClassesSearch.addEventListener('input', filterClasses);
        classesFilter.addEventListener('change', filterClasses);
    
        classesFilter.innerHTML = '<option value="">All Grades</option>';
    
        try {
            // Fetch Grades
            const gradesResponse = await fetch('/api/grades');
            if (!gradesResponse.ok) throw new Error('Failed to fetch grades');
            
            const grades = await gradesResponse.json();
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.name.toLowerCase(); // Normalize case for filtering
                option.textContent = grade.name;
                classesFilter.appendChild(option);
            });
    
            // Fetch Subjects (Store Globally)
            const subjectsResponse = await fetch('/api/subjects');
            if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
    
            const subjects = await subjectsResponse.json();
            subjectDict = subjects.map(subject => ({
                subject_id: subject.subject_id,
                name: `${subject.name}-${subject.type[0]}`,
            }));
    
            addClassesBtn.addEventListener('click', () => openModal('Add Classes', 'classes-form', null, subjectDict, NaN));
    
            // Fetch Classes
            const classesResponse = await fetch('/api/classes');
            if (!classesResponse.ok) throw new Error('Failed to fetch classes');
    
            allClasses = await classesResponse.json();
            if (allClasses.length > 0) {
                renderClassesTable(allClasses);
            }
    
        } catch (error) {
            console.error('API call failed:', error.message, error);
        }
    
        // Render Table
        function renderClassesTable(data) {
            classesTable.innerHTML = ''; // Clear table before rendering
    
            if (data.length === 0) {
                classesTable.innerHTML = '<tr><td colspan="6" style="text-align:center;">No classes found</td></tr>';
                return;
            }
    
            data.forEach(classData => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${classData.class_name}</td>
                    <td>${classData.grade_name}</td>
                    <td>${classData.students_count}</td>
                    <td>${classData.room_number}</td>
                    <td>${classData.subjects}</td>
                    <td>
                        <div class="teacher-actions">
                            <button class="btn btn-primary btn-sm" onclick="EditClassesDetails(${classData.class_id})">
                                Edit
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="DeleteClassesData(${classData.class_id})">
                                Delete
                            </button>
                        </div>
                    </td>`;
                classesTable.appendChild(row);
            });
        }
    
        // Edit Class Function
        window.EditClassesDetails = async (class_id) => {
            try {
                const response = await fetch(`/api/classes/${class_id}`);
                if (!response.ok) throw new Error('Failed to fetch class details');
    
                const classData = await response.json();
                openModal('Class Edit', 'edit-classes-form', classData, subjectDict, class_id);
            } catch (error) {
                console.error('Error fetching class details:', error);
                showToast(`Error loading class data: ${error.message}`, 'error');
            }
        };
    
        // Delete Class Function
        window.DeleteClassesData = async (class_id) => {
            try {
                if (!confirm('Are you sure you want to delete this class?')) return;
    
                const response = await fetch(`/api/classes/${class_id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete class');
    
                allClasses = allClasses.filter(classItem => classItem.class_id !== class_id);
                renderClassesTable(allClasses);
                showToast('Class deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting class:', error);
                showToast(`Error deleting class: ${error.message}`, 'error');
            }
        };
    
        // Filter Classes Function (Improved Logic)
        function filterClasses() {
            const searchTerm = ClassesSearch.value.toLowerCase();
            const selectedGrade = classesFilter.value.toLowerCase();
    
            const filteredClasses = allClasses.filter(classItem => 
                (classItem.class_name.toLowerCase().includes(searchTerm) || classItem.grade_name.toLowerCase().includes(searchTerm)) &&
                (selectedGrade === '' || classItem.grade_name.toLowerCase() === selectedGrade)
            );
    
            renderClassesTable(filteredClasses);
        }
    };
    
    // Classroom Management
    const initClassroomManagement = async() => {
        const addClassesBtn = document.getElementById('add-classroom-btn');
        const classroomSearch = document.getElementById('classroom-search');
        const classroomFilter = document.getElementById('classroom-type-filter');
        const classroomTable = document.getElementById('classroom-table');
        const tableBody = classroomTable.querySelector('tbody') || classroomTable;
        
        addClassesBtn.addEventListener('click', () => openModal('Add Classroom', 'classroom-form'));
        
        try {
            const response = await fetch('/api/classrooms', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const classroomData = await response.json();

            
            // Extract unique classroom types for filter
            const uniqueTypes = [...new Set(classroomData.map(c => c.type))];
            classroomFilter.innerHTML = `
                <option value="">All Types</option>
                ${uniqueTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            `;
            
            // Clear existing table content
            tableBody.innerHTML = '';
            
            classroomData.forEach((classroom) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${classroom.room_number}</td>
                    <td>${classroom.type}</td>
                    <td>${classroom.capacity}</td>
                    <td>${classroom.building}</td>
                    <td>${classroom.floor}</td>    
                    <td>
                        <div class="teacher-actions">
                            <button class="btn btn-primary btn-sm edit-btn" onclick="editClassroomDetails(${classroom.classroom_id})">
                                Edit
                            </button>
                            <button class="btn btn-secondary btn-sm delete-btn" onclick="deleteClassroomData(${classroom.classroom_id})">
                                Delete
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch(error) {
            console.error('Error fetching classroom data:', error);
        }
        
        // Filter functionality
        classroomSearch.addEventListener('input', filterClassrooms);
        classroomFilter.addEventListener('change', filterClassrooms);
    
        function filterClassrooms() {
            const searchTerm = classroomSearch.value.toLowerCase();
            const type = classroomFilter.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            
            rows.forEach((row) => {
                if (row.cells.length < 2) return; // Skip header row if present
                const roomNumberCell = row.cells[0].textContent.toLowerCase();
                const typeCell = row.cells[1].textContent.toLowerCase();
    
                const roomMatch = roomNumberCell.includes(searchTerm);
                const typeMatch = type === '' || typeCell === type;
    
                row.style.display = (roomMatch && typeMatch) ? '' : 'none';
            });
        }
        window.deleteClassroomData = async (classroomId) => {
            try {
                const response = await fetch(`/api/classrooms/${classroomId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to delete classroom');
                }
            }catch(error){
                console.error('Error deleting classroom:', error);
                // Show error message to user
                showToast('Failed to delete classroom. Please try again later.', 'error');
            }finally{
                window.location.reload()
            }
        };
        // Edit classroom details function
        window.editClassroomDetails = async (classroomId) => {
            try {
                const response = await fetch(`/api/classrooms/${classroomId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch classroom data');
                }
                const classroom = await response.json();
                
                openModal('Edit Classroom', 'edit-classroom-form',classroom, null, classroomId);
            } catch (error) {
                console.error('Error fetching classroom data:', error);
                // Show error message to user
                showToast('Failed to fetch classroom data. Please try again later.', 'error');
            }
        }; 
    };

    const initTimetableGeneration = async() => {
        const generateBtn = document.getElementById('generate-timetable-btn');
        const resetBtn = document.getElementById('reset-form-btn');

        const response = await fetch("/api/classes",{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if(!response.ok) {
            throw new Error('Failed to fetch classes');
        }
        const classes = await response.json();

        const checkbox =document.getElementById('classes-checkbox-group');
        classes.forEach((classItem) => {
            const checkboxItem = document.createElement('input');
            checkboxItem.type = 'checkbox';
            checkboxItem.id = classItem.class_id;
            checkboxItem.value = classItem.class_id;
            checkboxItem.name = 'classes';
            checkboxItem.className = 'class-checkbox';
            const label = document.createElement('label');
            label.htmlFor = classItem.class_id;
            label.textContent = classItem.class_name;
            checkbox.appendChild(checkboxItem);
            checkbox.appendChild(label);

        });
        // get the classes data
        const classResponse = await fetch('/api/classes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const classData = await classResponse.json();

        generateBtn.addEventListener('click', async () => {
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.style.display = 'flex';
            try {
                // I want classes info as this {id: class_id, name: class_name} related to the checkbox and classData
                const Data={
                    "timetable-name": document.getElementById('timetable-name').value,
                    "timetable-description":document.getElementById('timetable-description').value,
                    "start-date":document.getElementById('start-date').value,
                    "end-date":document.getElementById("end-date").value,
                    "school-start-time":document.getElementById("school-start-time").value,
                    "school-end-time":document.getElementById("school-end-time").value,
                    "lecture-duration":document.getElementById("lecture-duration").value,
                    "break-duration":document.getElementById("break-duration").value,
                    "classes":
                        Array.from(document.querySelectorAll('.class-checkbox:checked')).map((checkbox) => {
                            const classId = checkbox.value;
                            const classItem = classData.find((c) => c.class_id == classId);
                            return {id: classId, name: classItem ? classItem.class_name : classId};
                        }),
                    "classes-per-day":document.getElementById("classes-per-day").value,
                    "break-start-time":document.getElementById("lunch-break-start").value,
                    "allow-gaps":document.getElementById('allow-gaps').value,
                    "prioritize-teacher-prefs":document.getElementById('prioritize-teacher-prefs').value,
                    "max-consec-lectures-value":document.getElementById("max-consec-lectures-value").value,
                };

                const response = await fetch('/api/generate-timetable', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Data)
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to generate timetable');
                }
                loadingOverlay.style.display = 'none';
                showSuccessAlert('Timetable generated successfully!');
            } catch (genError) {
                loadingOverlay.style.display = 'none';
                showErrorAlert(`Generation failed: ${genError.message}`);
            }
        }); // end generateBtn click

        resetBtn.addEventListener('click', () => {
            document.querySelector('.timetable-form').reset();
        });

        // Toggle consecutive lectures option
        const maxConsecLecturesCheckbox = document.getElementById('max-consec-lectures');
        const consecLecturesGroup = document.getElementById('consec-lectures-group');

        maxConsecLecturesCheckbox.addEventListener('change', () => {
            consecLecturesGroup.style.display = maxConsecLecturesCheckbox.checked ? 'block' : 'none';
        });
    };

    const initPasswordChange = async()=>{
        const changePasswordBtn = document.getElementById('change-password-btn');

        changePasswordBtn.addEventListener(
            "click" , async () => {
                openModal(
                    'Change Password',
                    'change-password-form',
                )
            }
        )

    }

    // Modal Handling
    const openModal = (title, contentType, data=null, option_data=null, updated_id=NaN) => {
        const modal = document.getElementById('modal-container');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeBtn = document.getElementById('modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const saveBtn = document.getElementById('modal-save');

        modalTitle.textContent = title;
        
        // Dynamic content based on type
        switch(contentType) {

            case 'teacher-form':
                modalBody.innerHTML = `
                    <form id="teacher-form">
                        <div class="form-group">
                            <label for="name">Teacher's Name</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="Phone">Phone</label>
                            <input type="tel" id="Phone" name="Phone" required pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" maxlength="12" title="Please follow the format: 123-456-7890">
                        </div>
                        <div class="form-group">
                            <label for="department">Department</label>
                            <input type="text" id="department" name="department" required>
                        </div>
                        <div class="form-group">
                            <label for="weeklyhour">Weekly Hours</label>
                            <input type="text" id="weeklyhour" name="weeklyhour" required>
                        </div>
                    </form>
                `;
                // Format the phone number input
                const phoneInput = document.getElementById('Phone');
                phoneInput.addEventListener('input', (event) => {
                    const value = event.target.value.replace(/[^0-9]/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                    if (value) {
                        event.target.value = value[1] + (value[2] ? '-' + value[2] : '') + (value[3] ? '-' + value[3] : '');
                    } else {
                        event.target.value = '';
                    }
                });
                // Get the data from the form and log it as JSON when the save button is clicked
                saveBtn.addEventListener('click', async() => {
                    const formData = new FormData(document.getElementById('teacher-form')); // Properly references the form ID
                    const data = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('Phone'),
                        department: formData.get('department'),
                        weeklyhour: formData.get('weeklyhour'),
                    };
                    
                    try{
                        const response = await fetch('/api/teachers', {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        const result = await response.json();
                        // Check if the response is successful
                        if (result.success) {
                            console.log('Teacher added successfully:', result.data);
                        } else {
                            console.error('Error adding teacher:', result.error);
                        }
                    }
                    catch(error){
                        console.error(error);
                    }finally{
                        window.location.reload(); // Reload the page after adding a teacher
                    }
                });
                break;
            case 'edit-teacher-form':
                modalBody.innerHTML = `
                <form id="edit-teacher-form">
                    <div class="form-group">
                        <label for="name">Teacher's Name</label>
                        <input type="text" id="name" name="name" value="${data.teacher_name}" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="${data.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="Phone">Phone</label>
                        <input type="tel" id="Phone" name="Phone" required pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" maxlength="12" title="Please follow the format: 123-456-7890" value="${data.phone||''}">
                    </div>
                    <div class="form-group">
                        <label for="department">Department</label>
                        <input type="text" id="department" name="department" value="${data.department_name}" required>
                    </div>
                    <div class="form-group">
                        <label for="weeklyhour">Weekly Hours</label>
                        <input type="text" id="weeklyhour" name="weeklyhour" value="${data.weekly_hours}" required>
                    </div>
                </form>
                `;
                // Populate the form with existing data
                
                // Format the phone number input

                const phoneInputEdit = document.getElementById('Phone');
                phoneInputEdit.addEventListener('input', (event) => {
                    const value = event.target.value.replace(/[^0-9]/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                    if (value) {
                        event.target.value = value[1] + (value[2] ? '-' + value[2] : '') + (value[3] ? '-' + value[3] : '');
                    } else {
                        event.target.value = '';
                    }
                });
                // Get the data from the form and log it as JSON when the save button is clicked
                saveBtn.addEventListener('click', async() => {
                    try {
                        const formData = new FormData(document.getElementById('edit-teacher-form')); // Properly references the form ID
                        const data = {
                            name: formData.get('name'),
                            email: formData.get('email'),
                            phone: formData.get('Phone'),
                            department: formData.get('department'),
                            weekly_hours: formData.get('weeklyhour'),
                        };
                        const response = await fetch(`/api/teachers/${updated_id}`, {
                            method: 'PUT',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        const result = await response.json();
                        showSuccessAlert('Teacher updated successfully!');

                    } catch (error) {
                        console.error('Error:', error);
                        showErrorAlert('Failed to update teacher. Please try again.');
                    }finally{

                        window.location.reload()
                    }
                });
                break;
            case 'classes-form':
                modalBody.innerHTML = `
                    <form id="classes-form">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="grade">Grade</label>
                            <input type="text" id="grade" name="grade" required>
                        </div>
                        <div class="form-group">
                            <label for="student">Student</label>
                            <input type="number" id="student" name="student" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="classroom">Classroom</label>
                            <select id="classroom" name="classroom">
                                <option value="">Select a classroom</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="subjects">Subjects</label>
                            <div class="subject-input-container">
                                <select id="subjectSelect">
                                    <option value="">Select a subject</option>
                                </select>
                                <button type="button" onclick="addSubject()">Add Subject</button>
                            </div>
                            <ul class="subject-list" id="subjectList">
                            </ul>
                            <input type="hidden" id="selectedSubjects" name="selectedSubjects">
                        </div>
                    </form>
                `;
                optionPopulate()
                async function optionPopulate(){
                        const classroom = await fetch(`/api/classrooms`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const classroomData = await classroom.json();

                    // split the data into regular and another type
                    // Make the filter case-insensitive
                    const regularClassroom = classroomData.filter(item => 
                        item.type.toLowerCase() === 'regular');
                    
                    // classroom select option
                    const classroomSelect = document.getElementById('classroom');
                    
                    classroomSelect.innerHTML = '<option value="">Select a classroom</option>';
                    
                    regularClassroom.forEach(item => {
                        const option = document.createElement('option');
                        // Use classroom_id instead of id to match database field
                        option.value = item.classroom_id || item.id;
                        option.textContent = item.room_number;
                        classroomSelect.appendChild(option);
                    });
                }
                // Event listener for the save button
                saveBtn.addEventListener('click', async () => {
                    try {
                        const form = document.getElementById('classes-form');
                        
                        // Basic form validation
                        if (!form.checkValidity()) {
                            form.reportValidity();
                            return;
                        }
                        
                        // Get form data
                        const name = document.getElementById('name').value;
                        const grade = document.getElementById('grade').value;
                        const student = document.getElementById('student').value;
                        const classroom = document.getElementById('classroom').value;
                        
                        // Get subjects
                        const selectedSubjectsInput = document.getElementById('selectedSubjects').value;
                        const subjects = selectedSubjectsInput ? selectedSubjectsInput.split(',') : [];
                        
                        // Create data object
                        const data = {
                            name: name,
                            grade: grade,
                            student: parseInt(student) || 0,
                            classroom: classroom || null, // Ensure null for empty selections
                            subjects: subjects,
                        };
                        
                        // Send data to server
                        const response = await fetch('/api/classes', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            // Show success message
                            showToast('Class saved successfully!', 'success');
                            
                            // Close modal or redirect
                            modal.style.display = 'none'; // Assuming 'modal' is your modal element
                            
                            // Reload the page to reflect changes
                            location.reload();
                        } else {
                            // Show error message
                            showToast('Error saving class: ' + (result.error || 'Unknown error'), 'error');
                        }
                    } catch (error) {
                        console.error('Error saving class:', error);
                        showToast('Error saving class: ' + error.message, 'error');
                    }
                });
                
                // Track selected subjects
                const selectedSubjects = new Set();
                
                // Check if lab element exists before trying to set its display property
                const labElement = document.getElementById('lab');
                if (labElement) {
                    labElement.style.display = 'none';
                }
                
                // Populate subject dropdown from option_data if available
                const subjectSelect = document.getElementById('subjectSelect');
                if (typeof option_data !== 'undefined' && Array.isArray(option_data)) {
                    option_data.forEach(subject => {
                        const option = document.createElement('option');
                        option.value = subject.subject_id;
                        option.textContent = subject.name || subject.id;
                        subjectSelect.appendChild(option);
                    });
                }
                                
                window.addSubject = function() {
                    const subjectSelect = document.getElementById('subjectSelect');
                    const subjectId = subjectSelect.value;
                    
                    if (!subjectId) {
                        showToast('Please select a subject!', 'warning');
                        return;
                    }
                    
                    // Check if already added
                    if (selectedSubjects.has(subjectId)) {
                        showToast('This subject is already added!', 'warning');
                        return;
                    }
                    
                    // Get the subject text from the selected option
                    const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;
                    
                    // Add to selected set
                    selectedSubjects.add(subjectId);
                    
                    // Add to the list
                    const subjectList = document.getElementById('subjectList');
                    const li = document.createElement('li');
                    li.className = 'subject-item';
                    li.dataset.id = subjectId;
                    li.innerHTML = `<span>${subjectText}</span>
                                    <button type="button" class="remove-btn" onclick="removeSubject(this, '${subjectId}')">✖</button>`;
                    
                    subjectList.appendChild(li);
                    
                    // Update hidden input
                    updateSelectedSubjects();
                };
            
                window.removeSubject = function(element, subjectId) {
                    // Remove from set
                    selectedSubjects.delete(subjectId);
                    
                    // Remove from list
                    element.parentElement.remove();
                    
                    // Update hidden input
                    updateSelectedSubjects();
                };
                
                function updateSelectedSubjects() {
                    // Update the hidden input with selected subject IDs
                    document.getElementById('selectedSubjects').value = Array.from(selectedSubjects).join(',');
                }
                
            break;
            case 'edit-classes-form':
                // Modal body HTML setup with form
                modalBody.innerHTML = `
                <form id="edit-classes-form">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="grade">Grade</label>
                        <input type="text" id="grade" name="grade" required>
                    </div>
                    <div class="form-group">
                        <label for="student">Student</label>
                        <input type="number" id="student" name="student" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="classroom">Classroom</label>
                        <select id="classroom" name="classroom">
                            <option value="">Select a classroom</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="subjects">Subjects</label>
                        <div class="subject-input-container">
                            <select id="subjectSelect">
                                <option value="">Select a subject</option>
                            </select>
                            <button type="button" onclick="addSubject()">Add Subject</button>
                        </div>
                        <ul class="subject-list" id="subjectList">
                        </ul>
                        <input type="hidden" id="selectedSubjects" name="selectedSubjects">
                    </div>
                    <input type="hidden" id="classId" name="classId">
                </form>
                `;

                // Track selected subjects
                const selectedSubjectsInfo = new Set();
                const subjectSelectElement = document.getElementById('subjectSelect');

                // Get class ID from the row that was clicked
                const classId = updated_id; // Assuming row has a data-id attribute
                document.getElementById('classId').value = classId;

                // Event listener for the save button
                saveBtn.addEventListener('click', async () => {
                try {
                    const form = document.getElementById('edit-classes-form');
                    
                    // Basic form validation
                    if (!form.checkValidity()) {
                        form.reportValidity();
                        return;
                    }
                    
                    // Get form data
                    const classId = document.getElementById('classId').value;
                    const name = document.getElementById('name').value;
                    const grade = document.getElementById('grade').value;
                    const student = document.getElementById('student').value;
                    const classroom = document.getElementById('classroom').value;
                    
                    // Get subjects
                    const selectedSubjectsInput = document.getElementById('selectedSubjects').value;
                    const subjects = selectedSubjectsInput ? selectedSubjectsInput.split(',') : [];
                    
                    // Create data object
                    const data = {
                        class_id: classId,
                        name: name,
                        grade: grade,
                        student: student,
                        classroom: classroom || null,
                        subjects: subjects,
                    };
                    
                    
                    // Send data to server
                    const response = await fetch(`api/classes/${classId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        // Show success message
                        showToast('Class updated successfully!', 'success');
                        
                        // Close modal
                        modal.style.display = 'none';
                        
                        // Reload the page to reflect changes
                        location.reload();
                    } else {
                        // Show error message
                        showToast('Error updating class: ' + (result.error || 'Unknown error'), 'error');
                    }
                } catch (error) {
                    console.error('Error updating class:', error);
                    showToast('Error updating class: ' + error.message, 'error');
                }
                });

                // Populate subject dropdown and classroom dropdown
                PopulatingDataInfo();

                // Fetch class data and populate form
                fetchClassData(classId);

                async function fetchClassData(classId) {
                try {
                    const response = await fetch(`/api/classes/${classId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch class data');
                    }
                    
                    const classData = await response.json();
                    
                    // Populate form with class data
                    document.getElementById('name').value = classData.class_info['class_name'] || '';
                    document.getElementById('grade').value = classData.class_info['grade_name'] || '';
                    document.getElementById('student').value = classData.class_info['students_count'] || 0;
                    
                    // Set classroom value once dropdown is populated
                    if (classData.class_info) {
                        setTimeout(() => {
                            const classroomSelect = document.getElementById('classroom');
                            classroomSelect.value = classData.class_info['classroom_id'];
                        }, 300); // Small delay to ensure classroom dropdown is populated
                    }
                    
                    // Populate subjects list
                    if (classData.subjects && Array.isArray(classData.subjects)) {
                        // Clear any existing subjects
                        document.getElementById('subjectList').innerHTML = '';
                        selectedSubjectsInfo.clear();
                        const subjects = classData['subjects'] || [];
                        
                        // Add each subject to the list
                        subjects.forEach(subjectId => {
                            // Convert subject_id to string for consistency
                            const subjectIdString = String(subjectId['subject_id']);
                            selectedSubjectsInfo.add(subjectIdString);
                            
                            const subjectList = document.getElementById('subjectList');
                            const li = document.createElement('li');
                            li.className = 'subject-item';
                            li.dataset.id = subjectIdString;
                            li.innerHTML = `<span>${subjectId['subjects'] || subjectId['subject_id']}</span>
                                            <button type="button" class="remove-btn" onclick="removeSubject(this, '${subjectIdString}')">✖</button>`;
                            subjectList.appendChild(li);
                        });
                        
                        // Update hidden input
                        updateSelectedSubjects();
                    }
                } catch (error) {
                    console.error('Error fetching class data:', error);
                    showToast('Error loading class data: ' + error.message, 'error');
                }
                }

                async function PopulatingDataInfo() {
                try {
                    // Populate subject dropdown from option_data if available
                    const subjectSelect = document.getElementById('subjectSelect');
                    if (typeof option_data !== 'undefined' && Array.isArray(option_data)) {
                        option_data.forEach(subject => {
                            const option = document.createElement('option');
                            option.value = subject.subject_id;
                            option.textContent = subject.name || subject.id;
                            subjectSelect.appendChild(option);
                        });
                    }
                    
                    // fetch classrooms
                    const classroom = await fetch(`/api/classrooms`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const classroomData = await classroom.json();

                    // split the data into regular and another type
                    // Make the filter case-insensitive
                    const regularClassroom = classroomData.filter(item => 
                        item.type.toLowerCase() === 'regular');
                    
                    // classroom select option
                    const classroomSelect = document.getElementById('classroom');
                    
                    classroomSelect.innerHTML = '<option value="">Select a classroom</option>';
                    
                    regularClassroom.forEach(item => {
                        const option = document.createElement('option');
                        // Use classroom_id instead of id to match database field
                        option.value = item.classroom_id || item.id;
                        option.textContent = item.room_number;
                        classroomSelect.appendChild(option);
                    });
                } catch (error) {
                    console.error('Error fetching dropdown data:', error);
                }
                }

                window.addSubject = function() {
                const subjectSelect = document.getElementById('subjectSelect');
                const subjectId = String(subjectSelect.value); // Convert to string for consistency

                if (!subjectId) {
                    showToast('Please select a subject!', 'warning');
                    return;
                }

                // Check if already added
                if (selectedSubjectsInfo.has(subjectId)) {
                    showToast('This subject is already added!', 'warning');
                    return;
                }

                // Get the subject text from the selected option
                const subjectText = subjectSelect.options[subjectSelect.selectedIndex].text;

                // Add to selected set
                selectedSubjectsInfo.add(subjectId);

                // Add to the list
                const subjectList = document.getElementById('subjectList');
                const li = document.createElement('li');
                li.className = 'subject-item';
                li.dataset.id = subjectId;
                li.innerHTML = `<span>${subjectText}</span>
                                <button type="button" class="remove-btn" onclick="removeSubject(this, '${subjectId}')">✖</button>`;

                subjectList.appendChild(li);

                // Update hidden input
                updateSelectedSubjects();

                console.log("Subject added:", subjectId);
                console.log("Current subjects:", Array.from(selectedSubjectsInfo));
                };

                window.removeSubject = function(element, subjectId) {
                // Ensure we're working with string for consistency
                const subjectIdString = String(subjectId);

                console.log("Removing subject ID:", subjectIdString);
                console.log("Before removal:", Array.from(selectedSubjectsInfo));

                // Remove from set
                selectedSubjectsInfo.delete(subjectIdString);

                // Remove from list
                const listItem = element.closest('.subject-item');
                if (listItem) {
                    listItem.remove();
                } else {
                    element.parentElement.remove();
                }

                // Update hidden input
                updateSelectedSubjects();

                console.log("After removal:", Array.from(selectedSubjectsInfo));
                };

                function updateSelectedSubjects() {
                // Update the hidden input with selected subject IDs
                document.getElementById('selectedSubjects').value = Array.from(selectedSubjectsInfo).join(',');
                console.log("Updated selected subjects:", document.getElementById('selectedSubjects').value);
                }
                
            break;
            case 'subject-form':
                // call the function
                modalBody.innerHTML = `
                    <form id="subjects-form">
                        <div class="form-group">
                            <label for="subject-name">Subject Name</label>
                            <input type="text" id="subject-name" name="subject-name" required>
                        </div>
                        <div class="form-group">
                            <label for="department-option">Department</label>
                            <select id="department-option" name="department-option">
                            
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="type">Type</label>
                            <select id="type-option" name="type-option">
                                <option id="type-option" value="Theory">Theory</option>
                                <option id="type-option" value="Practical">Practical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="weekly-hour">Weekly Hours</label>
                            <input type="number" id="weekly-hour" name="weekly-hour" required>
                        </div>
                        <div class="form-group">
                            <label for="teacher-option">Choose Teacher</label>
                            <select id="teacher-option" name="teacher-option">
                            </select>
                        </div>
                    </form>
                `;
                PopulatingData(option_data);
                // Function to populate department and teacher dropdowns
                async function PopulatingData(option_data) {
                    const departmentOption = document.getElementById('department-option');
                    const teacherOption = document.getElementById('teacher-option');
                
                    // Check if option_data exists
                    if (!option_data) {
                        console.error('option_data is null or undefined');
                        return;
                    }
                    // Check if departments and teachers exist in option_data
                    const department = option_data.departments || [];
                    const teacher = option_data.teachers || [];

                    // Add departments to dropdown
                    if (Array.isArray(department)) {
                        department.forEach(dept => {
                            if (dept && dept.department_id && dept.name) {
                                const option = document.createElement('option');
                                option.value = dept['department_id'];
                                option.text = dept['name'];
                                departmentOption.add(option);
                            }
                        });
                    }
                    // Add teachers to dropdown
                    if (Array.isArray(teacher)) {
                        teacher.forEach(teach => {
                            if (teach && teach.teacher_id && teach.teacher_name) {
                                const option = document.createElement('option');
                                option.value = teach.teacher_id;
                                option.text = teach.teacher_name;
                                teacherOption.add(option);
                            }
                        });
                    }
                }
                saveBtn.addEventListener("click", async()=>{
                    const formData=new FormData(document.getElementById("subjects-form"))

                    const data={
                        "subject_name":formData.get("subject-name"),
                        "department_id":formData.get("department-option"),
                        "teacher_id":formData.get("teacher-option"),
                        "weekly_hours":formData.get("weekly-hour"),
                        "type_subject":formData.get("type-option")
                    }
                    try{
                        const Responce=await fetch("/api/subjects",{
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json"
                            },
                            body:JSON.stringify(data)
                        })
                        const result=await Responce.json()
                        if(result.status===200){
                            console.log(result.data)
                            showToast('Subject Added Successfully', 'success');
                        }
                    }catch(error){
                        console.error(error)
                    }finally{
                        window.location.reload()
                    }
                })
            break;
            case "edit-subject-form":
            modalBody.innerHTML = `
                <form id="edit-subject-form">
                        <div class="form-group">
                            <label for="subject-name">Subject Name</label>
                            <input type="text" id="subject-name" name="subject-name" value="${data.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="department-option">Department</label>
                            <select id="department-option" name="department-option">
                            
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="type">Type</label>
                            <select id="type-option" name="type-option">
                                <option id="type-option" value="Theory" ${data.type === 'Theory' ? 'selected' : ''} >Theory</option>
                                <option id="type-option" value="Practical" ${data.type === 'Practical' ? 'selected' : ''}>Practical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="weekly-hour">Weekly Hours</label>
                            <input type="number" id="weekly-hour" name="weekly-hour" value="${data.weekly_hours}" required>
                        </div>
                        <div class="form-group">
                            <label for="teacher-option">Choose Teacher</label>
                            <select id="teacher-option" name="teacher-option">
                            </select>
                        </div>
                    </form>
            `;
            PopulatingDataEdit(option_data);
                // Function to populate department and teacher dropdowns
            async function PopulatingDataEdit(option_data) {
                const departmentOption = document.getElementById('department-option');
                const teacherOption = document.getElementById('teacher-option');
            
                // Check if option_data exists
                if (!option_data) {
                    console.error('option_data is null or undefined');
                    return;
                }
                // Check if departments and teachers exist in option_data
                const department = option_data.departments || [];
                const teacher = option_data.teachers || [];
                // Add departments to dropdown
                if (Array.isArray(department)) {
                    department.forEach(dept => {
                        if (dept && dept.department_id && dept.name) {
                            const option = document.createElement('option');
                            option.value = dept['department_id'];
                            option.text = dept['name'];
                            // Write select value to show it
                            if (dept['department_id'] === data.department_id) {
                                option.selected = true;
                            }
                            departmentOption.add(option);
                        }
                    });
                }
                // Add teachers to dropdown
                if (Array.isArray(teacher)) {
                    teacher.forEach(teach => {
                        if (teach && teach.teacher_id && teach.teacher_id) {
                            const option = document.createElement('option');
                            option.value = teach.teacher_id;
                            option.text = teach.teacher_name;
                            if (teach['teacher_id'] === data.teacher_id) {
                                option.selected = true;
                            }
                            teacherOption.add(option);
                        }
                    });
                }
            }
            saveBtn.addEventListener('click', async () => {
                const formData = new FormData(document.getElementById('edit-subject-form'));
                const data = {
                    subject_name: formData.get('subject-name'),
                    type: formData.get('type-option'),
                    department_id: formData.get('department-option'),
                    teacher_id: formData.get('teacher-option'),
                    weekly_hours: formData.get('weekly-hour')
                };
                
                try {
                    const response = await fetch(`/api/subjects/${updated_id}`, {
                        method: 'PUT',
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log(result);
                    } else {
                        // Handle non-OK responses
                        console.error('Request failed with status:', response.status);
                    }
                } catch (error) {
                    console.error(error);
                }finally{
                    window.location.reload()
                }
            });
            break;
            case 'classroom-form':
                modalBody.innerHTML = `
                    <form id="classroom-form">
                        <div class="form-group">
                            <label for="room-number">Room Name/No.</label>
                            <input type="text" id="room-number" name="room-number" required>
                        </div>
                        <div class="form-group">
                            <label for="type">Type</label>
                            <select id="type" name="type">
                                <option value="regular">Regular</option>
                                <option value="laboratory">Laboratory</option>
                                <option value="computer Lab">Computer lab</option>
                                <option value="gym">Gym</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="capacity">Capacity</label>
                            <input type="number" id="capacity" name="capacity" required>
                        </div>
                        <div class="form-group">
                            <label for="building">Building Name</label>
                            <input type="text" id="building" name="building" required>
                        </div>
                        <div class="form-group">
                            <label for="floor">Floor No.</label>
                            <input type="text" id="floor" name="floor" required>
                        </div>
                    </form>
                `;
                saveBtn.addEventListener('click', async() => {
                    const formData = new FormData(document.getElementById('classroom-form'));
                    const data = {
                        room_number: formData.get('room-number'),
                        type: formData.get('type'),
                        capacity: formData.get('capacity'),
                        building: formData.get('building'),
                        floor: formData.get('floor'),
                    };
                    
                    try{
                        const response = await fetch('/api/classrooms', {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        const result = await response.json();
                        // Check if the response is successful
                        if (result.success) {
                            console.log('Classroom added successfully:', result.data);
                        } else {
                            console.error('Error adding classroom:', result.error);
                        }
                    }
                    catch(error){
                        console.error(error);
                    }finally{
                        window.location.reload(); // Reload the page after adding a classroom
                    }
                })
                
                break;
            case 'edit-classroom-form':
                const type = data.type;
                modalBody.innerHTML = `
                <form id="edit-classroom-form">
                    <div class="form-group">
                        <label for="room-number">Room Number</label>
                        <input type="text" id="room-number" name="room-number" value="${data.room_number || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="type">Type</label>
                        <select id="type" name="type">
                            <option value="regular" ${type === 'regular' ? 'selected' : ''}>Regular</option>
                            <option value="laboratory" ${type === 'laboratory' ? 'selected' : ''}>Laboratory</option>
                            <option value="computer lab" ${type === 'computer lab' ? 'selected' : ''}>Computer Lab</option>
                            <option value="gym" ${type === 'gym' ? 'selected' : ''}>Gym</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="capacity">Capacity</label>
                        <input type="number" id="capacity" name="capacity" value="${data.capacity || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="building">Building</label>
                        <input type="text" id="building" name="building" value="${data.building || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="floor">Floor</label>
                        <input type="text" id="floor" name="floor" value="${data.floor || '0'}" required>
                    </div>
                </form>                
                `;
                
                // Ensure the correct option is selected
                setTimeout(() => {
                    const typeSelect = document.getElementById('type');
                    if (typeSelect) {
                        for (let i = 0; i < typeSelect.options.length; i++) {
                            if (typeSelect.options[i].value === type) {
                                typeSelect.options[i].selected = true;
                                break;
                            }
                        }
                    }
                }, 0);
                // Add event listener to the form submission
                saveBtn.addEventListener('click', async() => {
                    // Get the form data
                    const form = document.getElementById('edit-classroom-form');
                    const formData = new FormData(form);
                    const data = {
                        room_number: formData.get('room-number'),
                        type: formData.get('type'),
                        capacity: formData.get('capacity'),
                        building: formData.get('building'),
                        floor: formData.get('floor') || '0',
                    };
                    
                    try {
                        const response = await fetch(`/api/classrooms/${updated_id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to update classroom');
                        }
                        
                        const result = await response.json();
                        console.log(result);
                        
                        // Optionally refresh the classroom list
                        await initClassroomManagement();
                        
                    } catch(error) {
                        console.error('Error updating classroom:', error);
                        showToast('Failed to update classroom: ' + error.message, 'error');
                    }finally{
                        window.location.reload()
                    }
                });
            break;
            case 'absence-form':
                modalBody.innerHTML = `
                <form id="record-absence-form">
                    <div class="form-group">
                        <label for="absence-teacher-select">Teacher *</label>
                        <select id="absence-teacher-select" name="teacher_id" required>
                            <option value="">Loading teachers...</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="absence-start-date">Start Date *</label>
                            <input type="date" id="absence-start-date" name="start_date" required>
                        </div>
                        <div class="form-group">
                            <label for="absence-end-date">End Date *</label>
                            <input type="date" id="absence-end-date" name="end_date" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="absence-reason">Reason</label>
                        <textarea id="absence-reason" name="reason" rows="3" placeholder="e.g. Sick leave, personal emergency..."></textarea>
                    </div>
                </form>
                `;
                // Populate teacher dropdown
                (async () => {
                    const sel = document.getElementById('absence-teacher-select');
                    try {
                        const res = await fetch('/api/teachers');
                        if (res.ok) {
                            const teachers = await res.json();
                            sel.innerHTML = '<option value="">Select Teacher</option>' +
                                teachers.map(t => `<option value="${t.teacher_id}">${t.teacher_name}</option>`).join('');
                        } else {
                            sel.innerHTML = '<option value="">Failed to load</option>';
                        }
                    } catch (_) {
                        sel.innerHTML = '<option value="">Error loading teachers</option>';
                    }
                })();
                // Set today as default start date
                (() => {
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('absence-start-date').value = today;
                    document.getElementById('absence-end-date').value = today;
                })();
                saveBtn.textContent = 'Record Absence';
                saveBtn.onclick = async () => {
                    const teacherId = document.getElementById('absence-teacher-select').value;
                    const startDate = document.getElementById('absence-start-date').value;
                    const endDate = document.getElementById('absence-end-date').value;
                    const reason = document.getElementById('absence-reason').value;
                    if (!teacherId || !startDate || !endDate) {
                        showErrorAlert('Please fill in all required fields.');
                        return;
                    }
                    if (endDate < startDate) {
                        showErrorAlert('End date must be on or after start date.');
                        return;
                    }
                    try {
                        const res = await fetch('/api/absences', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ teacher_id: teacherId, start_date: startDate, end_date: endDate, reason, status: 'pending' })
                        });
                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.error || 'Failed to record absence');
                        }
                        showSuccessAlert('Absence recorded successfully.');
                        modal.style.display = 'none';
                        // Reload absence table if visible — loadAbsences is scoped in initAbsenceManagement
                        if (typeof window.loadAbsences === 'function') await window.loadAbsences();
                    } catch (err) {
                        showErrorAlert(`Error: ${err.message}`);
                    }
                };
            break;   
            case "change-password-form":
                modalBody.innerHTML = `
                <form id="change-password-form">
                    <div class="form-group">
                        <label for="old-password">Old Password</label>
                        <input type="password" id="old-password" name="old-password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" name="new-password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" name="confirm-password" required>
                    </div>
                </form>
                `;
                saveBtn.textContent = "Change Password";

                // add function to check password and it valid
                saveBtn.onclick = async () =>{
                    const oldPassword = document.getElementById('old-password').value;
                    const newPassword = document.getElementById('new-password').value;
                    const confirmPassword = document.getElementById('confirm-password').value;

                    
                    if (newPassword !== confirmPassword) {
                        showErrorAlert("New password and confirmation do not match.");
                        return;
                    }

                    // Add logic to change password
                    try {
                        const response = await fetch('/api/change-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "current_password": oldPassword,
                                "new_password": newPassword
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Failed to change password');
                        }

                        const result = await response.json();
                        showSuccessAlert(result.message || 'Password changed successfully!');
                    } catch (error) {
                        showErrorAlert(error.message || 'An error occurred while changing the password.');
                    }
                }
            break;


        }
        modal.style.display = 'flex';

        closeBtn.onclick = cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };

        saveBtn.onclick = async () => {
            // Default handler — individual switch cases override this before the modal opens.
            modal.style.display = 'none';
        };
    };

    // Alert Handling — now wired to toast system
    const showSuccessAlert = (message) => {
        showToast(message, 'success');
    };

    const showErrorAlert = (message) => {
        showToast(message, 'error');
    };
    const initViewTimetable = async () => {
    const timetableBody = document.querySelector('#timetable-view tbody');

    // Utility to show error messages
    const showError = (message) => {
        timetableBody.innerHTML = `<tr><td colspan="6" class="error-message">${message}</td></tr>`;
    };

    const populateTimetableDropdown = (timetableParams) => {
        const timetableSelect = document.getElementById('timetable-select');
        timetableSelect.innerHTML = '';

        timetableParams.forEach((timetable, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${timetable.timetable_name} - ${timetable.timetable_description}`;
            timetableSelect.appendChild(option);
        });

        timetableSelect.addEventListener('change', () => {
            const selectedIndex = parseInt(timetableSelect.value);
            const selectedTimetableParams = timetableParams[selectedIndex];
            const selectedGeneratedValues = generatedValues[selectedIndex];
            updateFilters(selectedTimetableParams, selectedGeneratedValues);
            renderTimetable(timetableParams, generatedValues);
        });
    };

    const initializeFilters = (timetableParams, generatedValues) => {
        const viewTypeSelect = document.getElementById('view-type');
        viewTypeSelect.addEventListener('change', () => {
            toggleFilterGroups();
            renderTimetable(timetableParams, generatedValues);
        });

        if (timetableParams.length > 0) {
            updateFilters(timetableParams[0], generatedValues[0]);
        }

        document.getElementById('class-filter').addEventListener('change', () => {
            renderTimetable(timetableParams, generatedValues);
        });

        document.getElementById('teacher-filter').addEventListener('change', () => {
            renderTimetable(timetableParams, generatedValues);
        });

        document.getElementById('classroom-filter').addEventListener('change', () => {
            renderTimetable(timetableParams, generatedValues);
        });
    };

    const toggleFilterGroups = () => {
        const viewType = document.getElementById('view-type').value;
        const classGroup = document.getElementById('class-filter-group');
        const teacherGroup = document.getElementById('teacher-filter-group');
        const classroomGroup = document.getElementById('classroom-filter-group');

        classGroup.style.display = 'none';
        teacherGroup.style.display = 'none';
        classroomGroup.style.display = 'none';

        switch (viewType) {
            case 'class':
                classGroup.style.display = 'block';
                break;
            case 'teacher':
                teacherGroup.style.display = 'block';
                break;
            case 'classroom':
                classroomGroup.style.display = 'block';
                break;
        }
    };

    const updateFilters = (timetableParams, generatedValue) => {
        const generatedTimetable = typeof generatedValue === 'string' ? JSON.parse(generatedValue) : generatedValue;

        populateClassFilter(Object.keys(generatedTimetable));
        populateTeacherFilter(timetableParams.data.teachers);
        populateClassroomFilter(timetableParams.data.classes);
        toggleFilterGroups();
    };

    const populateClassFilter = (classes) => {
        const classFilter = document.getElementById('class-filter');
        classFilter.innerHTML = '<option value="all">All Classes</option>';
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    };

    const populateTeacherFilter = (teachers) => {
        const teacherFilter = document.getElementById('teacher-filter');
        teacherFilter.innerHTML = '<option value="all">All Teachers</option>';
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher;
            option.textContent = teacher;
            teacherFilter.appendChild(option);
        });
    };

    const populateClassroomFilter = (classes) => {
        const classroomFilter = document.getElementById('classroom-filter');
        classroomFilter.innerHTML = '<option value="all">All Classrooms</option>';
        const uniqueClassrooms = [...new Set(classes.map(cls => cls.room_number))];
        uniqueClassrooms.forEach(classroom => {
            const option = document.createElement('option');
            option.value = classroom;
            option.textContent = `Room ${classroom}`;
            classroomFilter.appendChild(option);
        });
    };

    const renderTimetable = (timetableParams, generatedValues) => {
        const selectedTimetableIndex = parseInt(document.getElementById('timetable-select').value) || 0;
        const selectedTimetableParams = timetableParams[selectedTimetableIndex];
        const selectedGeneratedValues = generatedValues[selectedTimetableIndex];

        if (!selectedGeneratedValues) {
            showError('No timetable data available');
            return;
        }

        const generatedTimetable = typeof selectedGeneratedValues === 'string' ? JSON.parse(selectedGeneratedValues) : selectedGeneratedValues;
        const viewType = document.getElementById('view-type').value;

        switch (viewType) {
            case 'class':
                renderClassView(generatedTimetable);
                break;
            case 'teacher':
                renderTeacherView(generatedTimetable, selectedTimetableParams);
                break;
            case 'classroom':
                renderClassroomView(generatedTimetable, selectedTimetableParams);
                break;
        }
    };

    const renderClassView = (generatedTimetable) => {
        const selectedClass = document.getElementById('class-filter').value;
        timetableBody.innerHTML = '';

        const classesToShow = selectedClass === 'all' ? Object.keys(generatedTimetable) : [selectedClass];

        classesToShow.forEach(className => {
            const classData = generatedTimetable[className];
            if (classData) renderClassTimetable(classData, className);
        });
    };

    const renderTeacherView = (generatedTimetable, timetableParams) => {
        const selectedTeacher = document.getElementById('teacher-filter').value;
        timetableBody.innerHTML = '';
        const teacherSchedule = filterByTeacher(generatedTimetable, selectedTeacher);
        renderFilteredSchedule(teacherSchedule, `Teacher: ${selectedTeacher}`);
    };

    const renderClassroomView = (generatedTimetable, timetableParams) => {
        const selectedClassroom = document.getElementById('classroom-filter').value;
        timetableBody.innerHTML = '';
        const classroomSchedule = filterByClassroom(generatedTimetable, selectedClassroom);
        renderFilteredSchedule(classroomSchedule, `Classroom: ${selectedClassroom}`);
    };

    const renderClassTimetable = (classData, className) => {
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<td colspan="6" class="class-header"><strong>${className}</strong></td>`;
        timetableBody.appendChild(headerRow);

        const allTimeSlots = new Set();
        Object.values(classData).forEach(dayData => {
            Object.keys(dayData).forEach(timeSlot => {
                allTimeSlots.add(timeSlot);
            });
        });

        const sortedTimeSlots = Array.from(allTimeSlots).sort(compareTimeSlots);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        sortedTimeSlots.forEach(timeSlot => {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = timeSlot;
            timeCell.className = 'time-slot';
            row.appendChild(timeCell);

            days.forEach(day => {
                const cell = document.createElement('td');
                cell.className = 'timetable-cell';
                if (classData[day] && classData[day][timeSlot]) {
                    const scheduleData = classData[day][timeSlot];
                    cell.innerHTML = `
                        <div class="class-info ${scheduleData.type.toLowerCase()}">
                            <div class="subject">${scheduleData.subject}</div>
                            <div class="classroom">Room: ${scheduleData.classroom}</div>
                            <div class="type">${scheduleData.type}</div>
                        </div>`;
                } else {
                    cell.innerHTML = '<div class="no-class">-</div>';
                }
                row.appendChild(cell);
            });

            timetableBody.appendChild(row);
        });
    };

    const filterByTeacher = (generatedTimetable, teacherName) => {
        const filteredSchedule = {};
        Object.keys(generatedTimetable).forEach(className => {
            const classData = generatedTimetable[className];
            Object.keys(classData).forEach(day => {
                const dayData = classData[day];
                Object.keys(dayData).forEach(timeSlot => {
                    const scheduleData = dayData[timeSlot];
                    if (teacherName === 'all' || scheduleData.subject.includes(teacherName)) {
                        if (!filteredSchedule[day]) filteredSchedule[day] = {};
                        filteredSchedule[day][timeSlot] = { ...scheduleData, className };
                    }
                });
            });
        });
        return filteredSchedule;
    };

    const filterByClassroom = (generatedTimetable, classroomName) => {
        const filteredSchedule = {};
        Object.keys(generatedTimetable).forEach(className => {
            const classData = generatedTimetable[className];
            Object.keys(classData).forEach(day => {
                const dayData = classData[day];
                Object.keys(dayData).forEach(timeSlot => {
                    const scheduleData = dayData[timeSlot];
                    if (classroomName === 'all' || scheduleData.classroom === classroomName) {
                        if (!filteredSchedule[day]) filteredSchedule[day] = {};
                        filteredSchedule[day][timeSlot] = { ...scheduleData, className };
                    }
                });
            });
        });
        return filteredSchedule;
    };

    const renderFilteredSchedule = (filteredSchedule, title) => {
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<td colspan="6" class="view-header"><strong>${title}</strong></td>`;
        timetableBody.appendChild(headerRow);

        const allTimeSlots = new Set();
        Object.values(filteredSchedule).forEach(dayData => {
            Object.keys(dayData).forEach(timeSlot => allTimeSlots.add(timeSlot));
        });

        const sortedTimeSlots = Array.from(allTimeSlots).sort(compareTimeSlots);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        sortedTimeSlots.forEach(timeSlot => {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = timeSlot;
            timeCell.className = 'time-slot';
            row.appendChild(timeCell);

            days.forEach(day => {
                const cell = document.createElement('td');
                cell.className = 'timetable-cell';
                if (filteredSchedule[day] && filteredSchedule[day][timeSlot]) {
                    const scheduleData = filteredSchedule[day][timeSlot];
                    cell.innerHTML = `
                        <div class="class-info ${scheduleData.type.toLowerCase()}">
                            <div class="subject">${scheduleData.subject}</div>
                            <div class="classroom">Room: ${scheduleData.classroom}</div>
                            <div class="class-name">${scheduleData.className}</div>
                            <div class="type">${scheduleData.type}</div>
                        </div>`;
                } else {
                    cell.innerHTML = '<div class="no-class">-</div>';
                }
                row.appendChild(cell);
            });

            timetableBody.appendChild(row);
        });
    };

    const compareTimeSlots = (a, b) => {
        const parseTime = (timeStr) => {
            let cleanTime = timeStr.toLowerCase().replace(/am|pm/g, '').trim();
            if (timeStr.includes('to')) cleanTime = cleanTime.split(' to ')[0];
            const [hour, minute] = cleanTime.split(':').map(Number);
            let adjustedHour = hour;
            if (timeStr.toLowerCase().includes('pm') && hour !== 12) adjustedHour += 12;
            if (timeStr.toLowerCase().includes('am') && hour === 12) adjustedHour = 0;
            return adjustedHour * 60 + (minute || 0);
        };
        return parseTime(a) - parseTime(b);
    };

    // Clear old table
    timetableBody.innerHTML = '';

    try {
        const response = await fetch('api/view-timetables');
        const data = await response.json();
        console.log('Backend response:', data);

        const timetableParams = data['Time-Params'];
        const generatedValues = data['Generated-Value'];

        populateTimetableDropdown(timetableParams);
        initializeFilters(timetableParams, generatedValues);
        renderTimetable(timetableParams, generatedValues);

    } catch (error) {
        console.error('Error fetching timetable data:', error);
        showError('Error loading timetable data');
    }
    };

    // Absence Management — full implementation with CRUD and filtering
    const initAbsenceManagement = async () => {
        const addAbsenceBtn = document.getElementById('add-absence-btn');
        const autoSuggestBtn = document.getElementById('auto-suggest-btn');
        const manualAssignBtn = document.getElementById('manual-assign-btn');
        const rescheduleBtn = document.getElementById('reschedule-btn');
        const dateFilter = document.getElementById('absence-date-filter');
        const teacherFilter = document.getElementById('absence-teacher-filter');
        const statusFilter = document.getElementById('absence-status-filter');
        const absenceTbody = document.querySelector('#absences-table tbody');

        let allAbsences = [];

        // Populate teacher filter dropdown
        const populateTeacherDropdown = async () => {
            try {
                const res = await fetch('/api/teachers');
                if (!res.ok) return;
                const teachers = await res.json();
                teachers.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.teacher_id;
                    opt.textContent = t.teacher_name;
                    teacherFilter.appendChild(opt);
                });
            } catch (err) {
                console.error('Failed to load teachers for absence filter:', err);
            }
        };

        const renderAbsencesTable = (absences) => {
            if (!absenceTbody) return;
            absenceTbody.innerHTML = '';
            if (absences.length === 0) {
                absenceTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--dark-gray);padding:2rem;">No absences recorded. Click <strong>Record Absence</strong> to add one.</td></tr>';
                return;
            }

            const today = new Date().toISOString().split('T')[0];

            absences.forEach(absence => {
                const row = document.createElement('tr');

                // Duration in days
                const startD = new Date(absence.start_date);
                const endD   = new Date(absence.end_date);
                const durationDays = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
                const durationLabel = durationDays === 1 ? '1 day' : `${durationDays} days`;

                // Date range string
                const dateRange = absence.start_date === absence.end_date
                    ? absence.start_date
                    : `${absence.start_date} \u2192 ${absence.end_date}`;

                // Is the teacher currently absent right now?
                const isNow = absence.status === 'pending'
                    && today >= absence.start_date
                    && today <= absence.end_date;

                // Build status badge
                const statusBadge = isNow
                    ? `<span class="status-badge status-pending" style="display:inline-flex;align-items:center;gap:5px;">
                           <span style="width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block;"></span>
                           Absent Now
                       </span>`
                    : `<span class="status-badge status-${absence.status}">${absence.status}</span>`;

                // Teacher cell — highlighted when currently absent
                const teacherCell = isNow
                    ? `<strong style="color:var(--danger-color,#e74c3c);">${absence.teacher_name || 'Unknown'}</strong>
                       <span style="font-size:0.7rem;color:var(--danger-color,#e74c3c);display:block;margin-top:2px;font-weight:600;">\u25cf Currently Absent</span>`
                    : `<strong>${absence.teacher_name || 'Unknown'}</strong>`;

                // Reason — truncated with tooltip for long values
                const reason = absence.reason || '\u2014';
                const reasonDisplay = reason.length > 70
                    ? `<span title="${reason.replace(/"/g, '&quot;')}" style="cursor:help;">${reason.substring(0, 67)}\u2026</span>`
                    : reason;

                // Action buttons — no Resolve for already resolved rows
                const actionBtns = absence.status === 'resolved'
                    ? `<button class="btn btn-secondary btn-sm" onclick="deleteAbsence(${absence.absence_id})">Delete</button>`
                    : `<button class="btn btn-primary btn-sm" onclick="resolveAbsence(${absence.absence_id})" title="AI suggest / manual assign / reschedule">Resolve</button>
                       <button class="btn btn-secondary btn-sm" onclick="deleteAbsence(${absence.absence_id})">Delete</button>`;

                // Visually highlight active absences
                if (isNow) {
                    row.style.background  = 'rgba(231,76,60,0.04)';
                    row.style.borderLeft  = '3px solid var(--danger-color,#e74c3c)';
                }

                row.innerHTML = `
                    <td style="min-width:130px;">${teacherCell}</td>
                    <td style="white-space:nowrap;">
                        ${dateRange}
                        <span style="font-size:0.75rem;color:var(--dark-gray);display:block;">${durationLabel}</span>
                    </td>
                    <td style="max-width:220px;word-break:break-word;">${reasonDisplay}</td>
                    <td style="white-space:nowrap;">${durationLabel}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="teacher-actions" style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                            ${actionBtns}
                        </div>
                    </td>`;
                absenceTbody.appendChild(row);
            });
        };

        const filterAbsences = () => {
            const dateVal = dateFilter ? dateFilter.value : '';
            const teacherVal = teacherFilter ? teacherFilter.value : 'all';
            const statusVal = statusFilter ? statusFilter.value : 'all';

            const filtered = allAbsences.filter(a => {
                const dateMatch = !dateVal || a.start_date <= dateVal && a.end_date >= dateVal;
                const teacherMatch = teacherVal === 'all' || String(a.teacher_id) === String(teacherVal);
                const statusMatch = statusVal === 'all' || a.status === statusVal;
                return dateMatch && teacherMatch && statusMatch;
            });
            renderAbsencesTable(filtered);
        };

        const loadAbsences = async () => {
            if (!absenceTbody) return;
            absenceTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;">Loading...</td></tr>';
            try {
                const res = await fetch('/api/absences');
                if (!res.ok) throw new Error('Failed to fetch absences');
                allAbsences = await res.json();
                renderAbsencesTable(allAbsences);
            } catch (err) {
                console.error('Error loading absences:', err);
                if (absenceTbody) {
                    absenceTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger-color);">Failed to load absences.</td></tr>`;
                }
            }
        };
        // Expose globally so the absence-form modal save handler can trigger a table refresh
        window.loadAbsences = loadAbsences;

        // Tracks which absence is currently being resolved via the solutions panel
        let activeAbsenceId = null;

        const hideSolutionsPanel = () => {
            const panel = document.getElementById('absence-solutions');
            if (panel) panel.style.display = 'none';
            activeAbsenceId = null;
        };

        // "Resolve" row button — shows the solutions panel for the chosen absence
        window.resolveAbsence = (absenceId) => {
            activeAbsenceId = absenceId;
            const panel = document.getElementById('absence-solutions');
            if (panel) {
                panel.style.display = 'block';
                panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        };

        window.deleteAbsence = async (absenceId) => {
            if (!confirm('Delete this absence record?')) return;
            try {
                const res = await fetch(`/api/absences/${absenceId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete absence');
                showSuccessAlert('Absence deleted.');
                hideSolutionsPanel();
                await loadAbsences();
            } catch (err) {
                showErrorAlert(`Error: ${err.message}`);
            }
        };

        if (addAbsenceBtn) {
            addAbsenceBtn.addEventListener('click', () => {
                hideSolutionsPanel();
                openModal('Record Absence', 'absence-form');
            });
        }

        // ── Auto-Suggest ────────────────────────────────────────────────────────
        if (autoSuggestBtn) {
            autoSuggestBtn.addEventListener('click', async () => {
                if (!activeAbsenceId) {
                    showErrorAlert('Please select an absence to resolve first.');
                    return;
                }
                const modal = document.getElementById('modal-container');
                const modalTitle = document.getElementById('modal-title');
                const modalBody = document.getElementById('modal-body');
                const saveBtn = document.getElementById('modal-save');

                modalTitle.textContent = 'AI Replacement Suggestions';
                modalBody.innerHTML = '<p style="text-align:center;padding:1rem;">Loading suggestions…</p>';
                saveBtn.textContent = 'Assign Selected';
                modal.style.display = 'flex';

                const closeBtn = document.getElementById('modal-close');
                const cancelBtn = document.getElementById('modal-cancel');
                closeBtn.onclick = cancelBtn.onclick = () => { modal.style.display = 'none'; };

                try {
                    const res = await fetch(`/api/absences/${activeAbsenceId}/auto-suggest`);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to fetch suggestions');

                    if (!data.suggestions || data.suggestions.length === 0) {
                        modalBody.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--dark-gray);">No available teachers found for this period.</p>';
                        saveBtn.disabled = true;
                        return;
                    }

                    saveBtn.disabled = false;
                    const rows = data.suggestions.map((t, i) => `
                        <tr>
                            <td><input type="radio" name="suggest-teacher" value="${t.teacher_id}" id="st-${i}" ${i === 0 ? 'checked' : ''}></td>
                            <td><label for="st-${i}">${t.teacher_name}</label></td>
                            <td>${t.department_name || '—'}</td>
                            <td>${t.weekly_hours ?? '—'} hrs</td>
                        </tr>`).join('');

                    modalBody.innerHTML = `
                        <p style="margin-bottom:0.75rem;">
                            Covering for <strong>${data.absent_teacher}</strong>
                            (${data.period.start} – ${data.period.end})
                        </p>
                        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
                            <thead>
                                <tr style="background:var(--surface-2,#f0f0f0);">
                                    <th style="padding:0.5rem;text-align:left;"></th>
                                    <th style="padding:0.5rem;text-align:left;">Teacher</th>
                                    <th style="padding:0.5rem;text-align:left;">Department</th>
                                    <th style="padding:0.5rem;text-align:left;">Weekly hrs</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>`;

                    saveBtn.onclick = async () => {
                        const selected = modalBody.querySelector('input[name="suggest-teacher"]:checked');
                        if (!selected) { showErrorAlert('Please select a teacher.'); return; }
                        try {
                            const assignRes = await fetch(`/api/absences/${activeAbsenceId}/manual-assign`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ replacement_teacher_id: parseInt(selected.value, 10) })
                            });
                            const assignData = await assignRes.json();
                            if (!assignRes.ok) throw new Error(assignData.error || 'Assignment failed');
                            modal.style.display = 'none';
                            showSuccessAlert(assignData.message);
                            hideSolutionsPanel();
                            await loadAbsences();
                        } catch (err) {
                            showErrorAlert(`Error: ${err.message}`);
                        }
                    };

                } catch (err) {
                    modalBody.innerHTML = `<p style="color:var(--danger,red);padding:1rem;">${err.message}</p>`;
                    saveBtn.disabled = true;
                }
            });
        }

        // ── Manual Assignment ────────────────────────────────────────────────────
        if (manualAssignBtn) {
            manualAssignBtn.addEventListener('click', async () => {
                if (!activeAbsenceId) {
                    showErrorAlert('Please select an absence to resolve first.');
                    return;
                }
                const modal = document.getElementById('modal-container');
                const modalTitle = document.getElementById('modal-title');
                const modalBody = document.getElementById('modal-body');
                const saveBtn = document.getElementById('modal-save');

                modalTitle.textContent = 'Assign Replacement Teacher';
                saveBtn.textContent = 'Assign';
                modal.style.display = 'flex';

                const closeBtn = document.getElementById('modal-close');
                const cancelBtn = document.getElementById('modal-cancel');
                closeBtn.onclick = cancelBtn.onclick = () => { modal.style.display = 'none'; };

                // Build teacher dropdown from already-fetched list or re-fetch
                let teacherOptions = '<option value="">— select teacher —</option>';
                try {
                    const tres = await fetch('/api/teachers');
                    if (tres.ok) {
                        const teachers = await tres.json();
                        teacherOptions += teachers.map(t =>
                            `<option value="${t.teacher_id}">${t.teacher_name}${t.department_name ? ' (' + t.department_name + ')' : ''}</option>`
                        ).join('');
                    }
                } catch (_) { /* proceed with empty list */ }

                modalBody.innerHTML = `
                    <div class="form-group">
                        <label for="manual-teacher-select">Select Replacement Teacher</label>
                        <select id="manual-teacher-select" style="width:100%;padding:0.5rem;margin-top:0.25rem;">
                            ${teacherOptions}
                        </select>
                    </div>`;

                saveBtn.onclick = async () => {
                    const sel = document.getElementById('manual-teacher-select');
                    if (!sel || !sel.value) { showErrorAlert('Please select a teacher.'); return; }
                    try {
                        const res = await fetch(`/api/absences/${activeAbsenceId}/manual-assign`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ replacement_teacher_id: parseInt(sel.value, 10) })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Assignment failed');
                        modal.style.display = 'none';
                        showSuccessAlert(data.message);
                        hideSolutionsPanel();
                        await loadAbsences();
                    } catch (err) {
                        showErrorAlert(`Error: ${err.message}`);
                    }
                };
            });
        }

        // ── Reschedule ────────────────────────────────────────────────────────────
        if (rescheduleBtn) {
            rescheduleBtn.addEventListener('click', () => {
                if (!activeAbsenceId) {
                    showErrorAlert('Please select an absence to resolve first.');
                    return;
                }
                const modal = document.getElementById('modal-container');
                const modalTitle = document.getElementById('modal-title');
                const modalBody = document.getElementById('modal-body');
                const saveBtn = document.getElementById('modal-save');

                modalTitle.textContent = 'Reschedule Affected Classes';
                saveBtn.textContent = 'Confirm Reschedule';
                const today = new Date().toISOString().split('T')[0];

                modalBody.innerHTML = `
                    <p style="margin-bottom:0.75rem;">Choose new dates for the affected classes:</p>
                    <div class="form-group">
                        <label for="reschedule-start">New Start Date *</label>
                        <input type="date" id="reschedule-start" value="${today}" min="${today}" style="width:100%;padding:0.5rem;margin-top:0.25rem;">
                    </div>
                    <div class="form-group" style="margin-top:0.75rem;">
                        <label for="reschedule-end">New End Date *</label>
                        <input type="date" id="reschedule-end" value="${today}" min="${today}" style="width:100%;padding:0.5rem;margin-top:0.25rem;">
                    </div>
                    <div class="form-group" style="margin-top:0.75rem;">
                        <label for="reschedule-note">Note (optional)</label>
                        <input type="text" id="reschedule-note" placeholder="e.g. Moved to next week" style="width:100%;padding:0.5rem;margin-top:0.25rem;">
                    </div>`;

                modal.style.display = 'flex';

                const closeBtn = document.getElementById('modal-close');
                const cancelBtn = document.getElementById('modal-cancel');
                closeBtn.onclick = cancelBtn.onclick = () => { modal.style.display = 'none'; };

                saveBtn.onclick = async () => {
                    const newStart = document.getElementById('reschedule-start').value;
                    const newEnd = document.getElementById('reschedule-end').value;
                    const note = document.getElementById('reschedule-note').value;
                    if (!newStart || !newEnd) { showErrorAlert('Both dates are required.'); return; }
                    if (newEnd < newStart) { showErrorAlert('End date must be on or after start date.'); return; }
                    try {
                        const res = await fetch(`/api/absences/${activeAbsenceId}/reschedule`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ new_start_date: newStart, new_end_date: newEnd, note })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Reschedule failed');
                        modal.style.display = 'none';
                        showSuccessAlert(data.message);
                        hideSolutionsPanel();
                        await loadAbsences();
                    } catch (err) {
                        showErrorAlert(`Error: ${err.message}`);
                    }
                };
            });
        }

        // Filter event listeners
        if (dateFilter) dateFilter.addEventListener('change', filterAbsences);
        if (teacherFilter) teacherFilter.addEventListener('change', filterAbsences);
        if (statusFilter) statusFilter.addEventListener('change', filterAbsences);

        await Promise.all([populateTeacherDropdown(), loadAbsences()]);
    };

    // Export and Print
    const initExportPrint = () => {
        const exportExcelBtn = document.getElementById('export-excel-btn');
        const printBtn = document.getElementById('print-timetable-btn');

        exportExcelBtn.addEventListener('click', () => {
            // Placeholder for Excel export logic
            showSuccessAlert('Timetable exported to Excel');
        });

        printBtn.addEventListener('click', () => {
            window.print();
        });
    };

    // Logout
    const initLogout = () => {
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => {
            // Clear any session data
            localStorage.clear();
            // Redirect to login page
            window.location.href = '/login';
        });
    };
    
    const initInternetCheckIfNotThrowError=()=>{
        const internetCheckInterval = setInterval(() => {
            if (navigator.onLine) {
                clearInterval(internetCheckInterval);
            }
            }, 1000);
    }
    // Initialize all modules
    const init = () => {
        initInternetCheckIfNotThrowError();
        initNavigation();
        initDashboardStats();
        initDashboardActions();
        initTeacherManagement();
        initClassesManagement();
        initSubjectsManagement();
        initClassroomManagement();
        initTimetableGeneration();
        initViewTimetable();
        initAbsenceManagement();
        initExportPrint();
        initLogout();
        initProfileStats();
        initPasswordChange();
    };

    // Start the application
    init();
});



document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('signup-name').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value,
                role: document.getElementById('signup-role').value
            };
            
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // If signup successful, redirect to login page
                    window.location.href = '/login';
                } else {
                    // Handle error
                    showToast(data.error || 'Signup failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.', 'error');
            }
        });
    }
});


// Dark Mode Toggle Functionality
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Save user preference to local storage
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Check for saved user preference on page load
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
});



function ImageUploadANY() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Accept only image files
    fileInput.style.display = 'none'; // Hide the input
    document.body.appendChild(fileInput);
    
    // Trigger the file selection dialog
    fileInput.click();
    
    // Handle file selection
    fileInput.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (!file) {
            document.body.removeChild(fileInput);
            return; // User canceled the dialog
        }
        
        // Check file type and size
        if (!file.type.match('image.*')) {
            showAlert('Please select an image file', 'error');
            document.body.removeChild(fileInput);
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showAlert('Image size should be less than 5MB', 'error');
            document.body.removeChild(fileInput);
            return;
        }
        
        try {
            // Show loading indicator
            showLoading('Uploading image...');
            
            // Create a FileReader for the preview
            const reader = new FileReader();
            
            // Set up the preview loading
            reader.onload = function(e) {
                // Update the profile image preview (if exists)
                const profileImg = document.querySelector('.profile-avatar img');
                if (profileImg) {
                    profileImg.src = e.target.result;
                }
            };
            
            // Start reading the file as DataURL (for preview only)
            reader.readAsDataURL(file);
            
            // Create FormData for the actual upload
            const formData = new FormData();
            formData.append('profile_picture', file);

            console.log('File being uploaded:', file.name, file.type, file.size);
            
            // Send the file to server
            const response = await fetch('/api/profile/profile_picture', {
                method: 'POST',
                body: formData,
                // Add credentials to ensure cookies are sent with the request
                credentials: 'same-origin'
            });
            
            // Hide loading indicator
            hideLoading();
            
            // Process the response
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Upload Error:', errorData.error || 'Unknown error');
                showAlert('Upload failed: ' + (errorData.error || 'Unknown error'), 'error');
            } else {
                const data = await response.json();
                showAlert(data.message || 'Profile image updated successfully', 'success');
            }
        } catch (error) {
            hideLoading();
            console.error('Network Error:', error);
            showAlert('A network error occurred. Please try again later.', 'error');
        } finally {
            // Clean up by removing the input element
            document.body.removeChild(fileInput);
        }
    });
}
// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
(function initToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
})();

const TOAST_ICONS = {
    success: 'fas fa-check-circle',
    error:   'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info:    'fas fa-info-circle',
};

function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <span class="toast__icon"><i class="${TOAST_ICONS[type] || TOAST_ICONS.info}"></i></span>
        <div class="toast__body">
            <div class="toast__message">${message}</div>
        </div>
        <button class="toast__close" aria-label="Dismiss">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => dismissToast(toast));

    container.appendChild(toast);

    // Auto-dismiss
    const timeoutId = setTimeout(() => dismissToast(toast), duration);
    toast._timeoutId = timeoutId;
}

function dismissToast(toast) {
    if (toast._dismissed) return;
    toast._dismissed = true;
    clearTimeout(toast._timeoutId);
    toast.classList.add('toast-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

// Backward-compatible aliases
function showAlert(message, type) {
    showToast(message, type);
}

function showLoading(message = 'Loading...') {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.querySelector('.loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        loadingOverlay.appendChild(spinner);
        
        const loadingMessage = document.createElement('p');
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = message;
        loadingOverlay.appendChild(loadingMessage);
        
        document.body.appendChild(loadingOverlay);
    } else {
        // Update message if overlay already exists
        document.getElementById('loading-message').textContent = message;
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}






















// Compact View Toggle Functionality
function initializeCompactView() {
    const compactViewCheckbox = document.getElementById('compact-view');
    const timetableContainer = document.querySelector('.timetable-container');
    const timetable = document.querySelector('.timetable');
    
    // Load saved compact view preference
    const savedCompactView = localStorage.getItem('compactViewEnabled');
    if (savedCompactView === 'true') {
        compactViewCheckbox.checked = true;
        enableCompactView();
    }
    
    // Add event listener for toggle
    compactViewCheckbox.addEventListener('change', function() {
        if (this.checked) {
            enableCompactView();
            localStorage.setItem('compactViewEnabled', 'true');
        } else {
            disableCompactView();
            localStorage.setItem('compactViewEnabled', 'false');
        }
    });
}

function enableCompactView() {
    const timetableContainer = document.querySelector('.timetable-container');
    const timetable = document.querySelector('.timetable');
    
    if (timetableContainer && timetable) {
        timetableContainer.classList.add('compact-view');
        timetable.classList.add('compact-view');
        
        // Add compact styles to all cells
        const cells = timetable.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.classList.add('compact-cell');
        });
        
        // Add compact styles to lecture content
        const lectures = timetable.querySelectorAll('.lecture, .class-info');
        lectures.forEach(lecture => {
            lecture.classList.add('compact-lecture');
        });
    }
    
    // Show notification
    showNotification('Compact view enabled', 'success');
}

function disableCompactView() {
    const timetableContainer = document.querySelector('.timetable-container');
    const timetable = document.querySelector('.timetable');
    
    if (timetableContainer && timetable) {
        timetableContainer.classList.remove('compact-view');
        timetable.classList.remove('compact-view');
        
        // Remove compact styles from all cells
        const cells = timetable.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.classList.remove('compact-cell');
        });
        
        // Remove compact styles from lecture content
        const lectures = timetable.querySelectorAll('.lecture, .class-info');
        lectures.forEach(lecture => {
            lecture.classList.remove('compact-lecture');
        });
    }
    
    // Show notification
    showNotification('Compact view disabled', 'success');
}

// Helper function to show notifications — delegates to toast system
function showNotification(message, type = 'success') {
    showToast(message, type);
}

// Initialize compact view when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCompactView();
});

// Additional utility functions for timetable management
function refreshTimetableView() {
    const compactViewCheckbox = document.getElementById('compact-view');
    if (compactViewCheckbox && compactViewCheckbox.checked) {
        enableCompactView();
    }
}

// Call this function after dynamically updating timetable content
function updateTimetableDisplay() {
    // Wait for DOM to update
    setTimeout(() => {
        refreshTimetableView();
    }, 100);
}

// Export functions for use in other scripts
window.timetableCompactView = {
    initialize: initializeCompactView,
    enable: enableCompactView,
    disable: disableCompactView,
    refresh: refreshTimetableView,
    update: updateTimetableDisplay
};