import base64
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()


def Generate_test_timetable(input_data):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.5-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"""{input_data}"""),
            ],
            
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_ONLY_HIGH",  # Block few
            ),
        ],
        
        response_mime_type="application/json",
        system_instruction=[
            types.Part.from_text(text="""Your are a teacher for timetable making and devlopment and next i want text is json and here is the example of it

assume Your are the professional timetable generation teacher
# start_time = \"1:30 pm\"
# end_time = \"6:00 pm\"
# break_start='3:10 pm'
# break_end='3:30 pm'
# No_of_lec=5
# no_of_subclass=2
# Teacher=['Nirbhay Sir', \"Ankit Sir\", \"Sufiyan Sir\", \"Seher Ma'am\", \"Kanisk Sir\", \"Anusha Ma'am\", \"Rahid Sir\"]
# name_batch = [\"FY\", \"SY\", \"TY\"]
# name_of_subclass=[\"AIML\",'CTIS']
# classrooms={\"classrooms\": [
#         {
#             \"class_name\": \"B.Sc AIML SEM IV\",
#             \"grade_name\": \"15\",
#             \"room_number\": \"404\",
#             \"students_count\": 67,
#             \"classroom_id\": 3
#         },
#         {
#             \"class_name\": \"B.Sc CTIS SEM IV\",
#             \"grade_name\": \"15\",
#             \"room_number\": \"405\",
#             \"students_count\": 20,
#             \"classroom_id\": 5
#         }
#     ]}
# subject_assign_to_tecacher_for_which_class={
#     \"Nirbhay Sir\": {
#         \"AIML\":{
#             \"FY\": [\"Python\"], 
#             \"SY\": [\"Machin Learning\", \"Data Visualisation\"],
#             \"TY\":[\"Deep Learning\"]
#         },
#         \"CTIS\":dict()
#     },
#     \"Ankit Sir\": {
#         \"AIML\":{
#             \"FY\": [\"Data Science\"],
#             \"SY\": [\"Python\"],
#             \"TY\":[\"Data Science\"]
#         },
#         \"CTIS\":dict(), 
#     },
#     \"Sufiyan Sir\": {
#         \"AIML\":{
#             \"FY\": [\"Data Science\"],
#             \"SY\": [\"Data Science\"],
#             \"TY\":[\"Data Science\"]
#         },
#         \"CTIS\":dict(),              
#     }
# }
# no_batch=3
# theory={
#     \"Nirbhay Sir\": {
#         \"AIML\":{
#             \"FY\": 2,
#             \"SY\": 2,
#             \"TY\": 1
#             },
#         \"CTIS\":dict()
#         },
#     \"Ankit Sir\": {
#         \"AIML\":{
#             \"FY\": 1,
#             \"SY\": 2,
#             \"TY\": 1
#             },
#         \"CTIS\":dict(),
#     },
#     \"Sufiay Sir\": {
#         \"AIML\":{
#             \"FY\": 1,
#             \"SY\": 1,
#             \"TY\": 1
#             },
#         \"CTIS\":dict(),
#         }
# }
# practical={
#     \"Nirbhay Sir\": {
#         \"AIML\":{
#             \"FY\": 2,
#             \"SY\": 2,
#             \"TY\": 1
#             },
#         \"CTIS\":dict(),
#         },
#     \"Ankit Sir\": {
#         \"AIML\":{
#             \"FY\": 1,
#             \"SY\": 2,
#             \"TY\": 1
#             },
#         \"CTIS\":dict(),
#         },
#     \"Sufiyan Sir\": {
#         \"AIML\":{
#             \"FY\": 1,
#             \"SY\": 1,
#             \"TY\": 1
#             },
#         \"CTIS\":dict(),
#         }
# }
Output:- 
    \"AIML FY\": {
                \"Monday\": {
                    \"1:30pm to 2:20pm\": {
                        \"subject\": \"Python (Nirbhay Sir)\",
                        \"classroom\": \"Room 101\",
                        \"type\": \"Theory\"
                    },
                    \"2:20pm to 3:10pm\": {
                        \"subject\": \"Data Science (Ankit Sir)\",
                        \"classroom\": \"Room 101\",
                        \"type\": \"Theory\"
                    },
                    \"3:30pm to 4:20pm\": {
                        \"subject\": \"Python Lab (Nirbhay Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    },
                    \"4:20pm to 5:10pm\": {
                        \"subject\": \"Data Science Lab (Sufiyan Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    }
                },
                \"Tuesday\": {
                    \"1:30pm to 2:20pm\": {
                        \"subject\": \"Python (Nirbhay Sir)\",
                        \"classroom\": \"Room 101\",
                        \"type\": \"Theory\"
                    },
                    \"2:20pm to 3:10pm\": {
                        \"subject\": \"Data Science (Sufiyan Sir)\",
                        \"classroom\": \"Room 101\",
                        \"type\": \"Theory\"
                    },
                    \"3:30pm to 4:20pm\": {
                        \"subject\": \"Data Science Lab (Ankit Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    },
                    \"4:20pm to 5:10pm\": {
                        \"subject\": \"Python Lab (Nirbhay Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    }
                },
                \"Wednesday\": {
                    \"1:30pm to 2:20pm\": {
                        \"subject\": \"Data Science (Ankit Sir)\",
                        \"classroom\": \"Room 101\",
                        \"type\": \"Theory\"
                    },
                    \"2:20pm to 3:10pm\": {
                        \"subject\": \"Python Lab (Nirbhay Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    },
                    \"3:30pm to 4:20pm\": {
                        \"subject\": \"Data Science Lab (Sufiyan Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    }
                },
                \"Thursday\": {
                    \"1:30pm to 2:20pm\": {
                        \"subject\": \"Data Science (Sufiyan Sir)\",
                        \"classroom\": \"Room 101\",
                        \"type\": \"Theory\"
                    },
                    \"2:20pm to 3:10pm\": {
                        \"subject\": \"Python Lab (Nirbhay Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    }
                },
                \"Friday\": {
                    \"1:30pm to 2:20pm\": {
                        \"subject\": \"Python Lab (Nirbhay Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    },
                    \"2:20pm to 3:10pm\": {
                        \"subject\": \"Data Science Lab (Ankit Sir)\",
                        \"classroom\": \"Lab 201\",
                        \"type\": \"Practical\"
                    }
                }
            }
        }

Understand that what you have to make after that i will give next input understand this"""),
        ],
    )
    output=""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        # print(chunk.text, end="")
        output += chunk.text+""

    return output

# if __name__ == "__main__":
#     data={
#         "teachers": [
#         "Manav Viral Darji"
#     ],
#     "name_batch": [
#         "15"
#     ],
#     "name_of_subclass": [
#         "AIML"
#     ],
#     "subject_assign_to_teacher_for_which_class": {
#         "Manav Viral Darji": {
#             "AIML": {
#                 "15": [
#                     "DeepLearning",
#                     "Python"
#                 ]
#             }
#         }
#     },
#     "no_batch": 1,
#     "theory": {
#         "Manav Viral Darji": {
#             "AIML": {
#                 "15": 56
#             }
#         }
#     },
#     "practical": {
#         "Manav Viral Darji": {
#             "AIML": {
#                 "15": 11
#             }
#         }
#     },
#     "teacher": [
#         {
#             "teacher_name": "Manav Viral Darji"
#         }
#     ],
#     "subjects": [
#         {
#             "teacher_name": "Manav Viral Darji",
#             "subject_list": [
#                 "DeepLearning",
#                 "Python"
#             ]
#         }
#     ],
#     "theory_and_practical": [
#         {
#             "teacher_name": "Manav Viral Darji",
#             "subject_name": "AIML 15",
#             "subject_type": "Theory",
#             "theory_count": 56,
#             "practical_count": 0
#         },
#         {
#             "teacher_name": "Manav Viral Darji",
#             "subject_name": "AIML 15",
#             "subject_type": "Practical",
#             "theory_count": 0,
#             "practical_count": 11
#         }
#     ],
#     "classrooms": [
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
#     ],
#     "classes": [
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
#     ],
#     "timetable_name": "First-Test-Time-table",
#     "timetable_description": "Time-Pass",
#     "start_date": "",
#     "end_date": "",
#     "start_time": "08:00",
#     "end_time": "16:00",
#     "lecture_duration": "45",
#     "break_duration": "10",
#     "classes_inc": [
#         {
#             "id": "1",
#             "name": "B.Sc AIML SEM IV"
#         },
#         {
#             "id": "4",
#             "name": "B.Sc CTIS SEM IV"
#         }
#     ],
#     "break_start": "12:00",
#     "prioritize_teacher_preferences": None,
#     "max_consecutive_lec": None,
#     "class_per_day": "6",
#     "allow_gaps": "on",
#     }
#     Output=Generate_test_timetable(data)
#     print(Output)
#     import json
#     # Convert the output to JSON format
#     Output = json.dumps(Output, indent=4)
#     # Ensure the output is a valid JSON string it has \n and \t
#     Output = Output.replace("\\n", "\n").replace("\\t", "\t").replace("\\\"", "\"").replace("\\\\", "\\")
#     Output = Output.removeprefix("\"").removesuffix("\"")
#     # create Output.json file for me
#     with open("Output.json", "w") as f:
#         f.write(Output)