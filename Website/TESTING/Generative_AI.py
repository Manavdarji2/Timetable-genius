import base64
import os
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
import os
# os.environ["GRPC_VERBOSITY"] = "ERROR"
# os.environ["GLOG_minloglevel"] = "2"


def generate(Input_ans):
    model=genai.GenerativeModel('gemini-1.5-flash-latest', generation_config = genai.GenerationConfig(max_output_tokens=10000))
    few_shot_promot=f"""
    Asume you are the teacher for making time table of student there are multiple batch this are the detail of the class i want you to assign the a time no extra thing just a time table for all class and no of batch and class and given info just generate an csv or xlsx file for just generat a table such i cam read in python pandas lib and can edit if need Generate a time tabel for me and i can read into csv or json file for pandas for to save the file, just undestand i want data like this and understand that you have to make the it just and example and under stand basend on this and generate for all class such that it dosen't clash of time with another class generate that type of thing for me and understand that i want time table for each class and each subclass i don't want code i want csv file such that it geneerate the time in much optimal way Now you have done the task of this now you have to understand that you don't have to give much info you are just a generative ai part for making time table and dont write extra thing and info and i need you to make this thing in dict value to read easly on pandas dataframe for easy use case understand i am returning the value to store in vraiable and to make a csv file or any other file userwant of each day Monday, Tuesday, Wenesday, Friday Saturday understand i dont want code i want timetable just that only in JSON; and much understand able and group by class and seperate value
    """+"""
    
    This is an example Data of the input and output format you have to follow:
    and you have to create the muliple timetable for each class and each batch and each subject and each teacher and each day of the week
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

    This is the example OUTPUT that i need for me
    Output:- 
    "FY": {
                "Monday": {
                    "1:30pm to 2:20pm": {
                        "subject": "Python (Nirbhay Sir)",
                        "classroom": "Room 101",
                        "type": "Theory"
                    },
                    "2:20pm to 3:10pm": {
                        "subject": "Data Science (Ankit Sir)",
                        "classroom": "Room 101",
                        "type": "Theory"
                    },
                    "3:30pm to 4:20pm": {
                        "subject": "Python Lab (Nirbhay Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    },
                    "4:20pm to 5:10pm": {
                        "subject": "Data Science Lab (Sufiyan Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    }
                },
                "Tuesday": {
                    "1:30pm to 2:20pm": {
                        "subject": "Python (Nirbhay Sir)",
                        "classroom": "Room 101",
                        "type": "Theory"
                    },
                    "2:20pm to 3:10pm": {
                        "subject": "Data Science (Sufiyan Sir)",
                        "classroom": "Room 101",
                        "type": "Theory"
                    },
                    "3:30pm to 4:20pm": {
                        "subject": "Data Science Lab (Ankit Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    },
                    "4:20pm to 5:10pm": {
                        "subject": "Python Lab (Nirbhay Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    }
                },
                "Wednesday": {
                    "1:30pm to 2:20pm": {
                        "subject": "Data Science (Ankit Sir)",
                        "classroom": "Room 101",
                        "type": "Theory"
                    },
                    "2:20pm to 3:10pm": {
                        "subject": "Python Lab (Nirbhay Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    },
                    "3:30pm to 4:20pm": {
                        "subject": "Data Science Lab (Sufiyan Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    }
                },
                "Thursday": {
                    "1:30pm to 2:20pm": {
                        "subject": "Data Science (Sufiyan Sir)",
                        "classroom": "Room 101",
                        "type": "Theory"
                    },
                    "2:20pm to 3:10pm": {
                        "subject": "Python Lab (Nirbhay Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    }
                },
                "Friday": {
                    "1:30pm to 2:20pm": {
                        "subject": "Python Lab (Nirbhay Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    },
                    "2:20pm to 3:10pm": {
                        "subject": "Data Science Lab (Ankit Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    }
                },
                "Saturday": {
                    "1:30pm to 2:20pm": {
                        "subject": "Python Lab (Nirbhay Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    },
                    "2:20pm to 3:10pm": {
                        "subject": "Data Science Lab (Sufiyan Sir)",
                        "classroom": "Lab 201",
                        "type": "Practical"
                    }
                }
            }
        }
    """
    response = model.generate_content(
        (few_shot_promot, Input_ans),
    )
    value=response.text
    return value 

# start_time = "1:30 pm"
# end_time = "6:00 pm"
# break_start='3:10 pm'
# break_end='3:30 pm'
# No_of_lec=5
# no_of_subclass=2
# Teacher=['Nirbhay Sir', "Ankit Sir", "Sufiyan Sir", "Seher Ma'am", "Kanisk Sir", "Anusha Ma'am", "Rahid Sir"]
# name_batch = ["FY", "SY", "TY"]
# name_of_subclass=["AIML",'CTIS']
# classrooms={"classrooms": [
#         {
#             "class_name": "B.Sc AIML SEM IV",
#             "grade_name": "15",
#             "room_number": "404",
#             "students_count": 67,
#             "classroom_id": 3
#         },
#         {
#             "class_name": "B.Sc CTIS SEM IV",
#             "grade_name": "15",
#             "room_number": "405",
#             "students_count": 20,
#             "classroom_id": 5
#         }
#     ]}
# subject_assign_to_tecacher_for_which_class={
#     "Nirbhay Sir": {
#         "AIML":{
#             "FY": ["Python"], 
#             "SY": ["Machin Learning", "Data Visualisation"],
#             "TY":["Deep Learning"]
#         },
#         "CTIS":dict()
#     },
#     "Ankit Sir": {
#         "AIML":{
#             "FY": ["Data Science"],
#             "SY": ["Python"],
#             "TY":["Data Science"]
#         },
#         "CTIS":dict(), 
#     },
#     "Sufiyan Sir": {
#         "AIML":{
#             "FY": ["Data Science"],
#             "SY": ["Data Science"],
#             "TY":["Data Science"]
#         },
#         "CTIS":dict(),              
#     }
# }
# no_batch=3
# theory={
#     "Nirbhay Sir": {
#         "AIML":{
#             "FY": 2,
#             "SY": 2,
#             "TY": 1
#             },
#         "CTIS":dict()
#         },
#     "Ankit Sir": {
#         "AIML":{
#             "FY": 1,
#             "SY": 2,
#             "TY": 1
#             },
#         "CTIS":dict(),
#     },
#     "Sufiay Sir": {
#         "AIML":{
#             "FY": 1,
#             "SY": 1,
#             "TY": 1
#             },
#         "CTIS":dict(),
#         }
# }
# practical={
#     "Nirbhay Sir": {
#         "AIML":{
#             "FY": 2,
#             "SY": 2,
#             "TY": 1
#             },
#         "CTIS":dict(),
#         },
#     "Ankit Sir": {
#         "AIML":{
#             "FY": 1,
#             "SY": 2,
#             "TY": 1
#             },
#         "CTIS":dict(),
#         },
#     "Sufiyan Sir": {
#         "AIML":{
#             "FY": 1,
#             "SY": 1,
#             "TY": 1
#             },
#         "CTIS":dict(),
#         }
# }

# input_ans=f"""Asume you are the teacher for making time table of student there are multiple batch 
# {Teacher=},{name_batch=},{start_time=}{end_time=},{break_start=}
# {break_end=}{practical=},{theory=},{no_batch=},{subject_assign_to_tecacher_for_which_class=},{name_of_subclass=},{No_of_lec=},{no_of_subclass=}{classrooms=}
# this are the detail of the class i want you to assign the a time no extra thing just a time table for all class and no of batch and class and given info just generate an csv or xlsx file for just generat a table such i cam read in python pandas lib and can edit if need Generate a time tabel for me and i can read into csv or json file for pandas for to save the file, just undestand i want data like this and understand that you have to make the it just and example and under stand basend on this and generate for all class such that it dosen't clash of time with another class generate that type of thing for me and understand that i want time table for each class and each subclass i don't want code i want csv file such that it geneerate the time in much optimal way Now you have done the task of this now you have to understand that you don't have to give much info you are just a generative ai part for making time table and dont write extra thing and info and i need you to make this thing in dict value to read easly on pandas dataframe for easy use case understand i am returning the value to store in vraiable and to make a csv file or any other file userwant of each day Monday, Tuesday, Wenesday, Friday Saturday understand i dont want code i want timetable just that only in JSON; and much understand able and group by class and seperate value"""
# value=generate(Input_ans=input_ans)
# print(value)
# value=value.replace("\n", "")
# value=value[value.find('```json')+7: value.rfind('```')]
