import React, { useState } from 'react';
import './App.css';

function App() {
  // State management
  const [classrooms, setClassrooms] = useState(3);
  const [labs, setLabs] = useState(2);
  const [teachers, setTeachers] = useState([
    { 
      id: 1, 
      name: "Dr. Sharma", 
      subjects: [
        { name: "C Programming", semester: "1st Semester" },
        { name: "Operating System", semester: "3rd Semester" },
        { name: "Networking", semester: "5th Semester" }
      ] 
    }
  ]);
  const [semesters, setSemesters] = useState([
    { 
      id: 1, 
      name: "1st Semester", 
      subjects: ["SEC", "C Programming", "Maths", "Entrepreneurship", "History", "English"] 
    },
    { 
      id: 3, 
      name: "3rd Semester", 
      subjects: ["OS", "DBMS", "Python", "Software", "Feature Engineering", "Indian Constitution"] 
    },
    { 
      id: 5, 
      name: "5th Semester", 
      subjects: ["AI", "Networking", "Software", "Python"] 
    }
  ]);
  const [breakTime, setBreakTime] = useState({ start: "11:00", end: "11:30" });
  const [labTimings, setLabTimings] = useState([
    { id: 1, start: "14:00", end: "16:00" },
    { id: 2, start: "15:00", end: "17:00" }
  ]);
  const [routine, setRoutine] = useState(null);
  const [activeTab, setActiveTab] = useState("config");
  const [newTeacher, setNewTeacher] = useState({ name: "", subject: "", semester: "" });

  // Add a new teacher
  const addTeacher = () => {
    if (newTeacher.name && newTeacher.subject && newTeacher.semester) {
      // Check if teacher already exists
      const existingTeacherIndex = teachers.findIndex(t => t.name === newTeacher.name);
      
      if (existingTeacherIndex >= 0) {
        // Add subject to existing teacher
        const updatedTeachers = [...teachers];
        updatedTeachers[existingTeacherIndex].subjects.push({
          name: newTeacher.subject,
          semester: newTeacher.semester
        });
        setTeachers(updatedTeachers);
      } else {
        // Create new teacher
        setTeachers([...teachers, { 
          id: teachers.length + 1, 
          name: newTeacher.name, 
          subjects: [{ name: newTeacher.subject, semester: newTeacher.semester }]
        }]);
      }
      
      setNewTeacher({ name: "", subject: "", semester: "" });
    }
  };

  // Remove a teacher
  const removeTeacher = (id) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  };

  // Remove a subject from a teacher
  const removeSubject = (teacherId, subjectIndex) => {
    const updatedTeachers = teachers.map(teacher => {
      if (teacher.id === teacherId) {
        return {
          ...teacher,
          subjects: teacher.subjects.filter((_, index) => index !== subjectIndex)
        };
      }
      return teacher;
    });
    setTeachers(updatedTeachers);
  };

  // Generate routine function
  const generateRoutine = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
      "9:00-10:00", "10:00-11:00", "11:00-11:30", "11:30-12:30", 
      "12:30-13:30", "14:00-16:00", "15:00-17:00"
    ];
    
    const generatedRoutine = {};
    
    days.forEach(day => {
      generatedRoutine[day] = {};
      timeSlots.forEach(slot => {
        if (slot === "11:00-11:30") {
          generatedRoutine[day][slot] = { type: "break", description: "Break Time" };
        } else if (slot === "14:00-16:00" || slot === "15:00-17:00") {
          // Lab sessions
          const labNumber = slot === "14:00-16:00" ? 1 : 2;
          let semester, subject;
          
          // Assign labs to different semesters on different days
          if (day === "Monday" || day === "Wednesday") {
            semester = "1st Semester";
            subject = "C Programming Lab";
          } else if (day === "Tuesday") {
            semester = "3rd Semester";
            subject = "Python Lab";
          } else {
            semester = "5th Semester";
            subject = "Networking Lab";
          }
          
          // Find teacher for this lab
          const labTeacher = teachers.find(t => 
            t.subjects.some(s => s.name.includes(subject.split(' ')[0]))
          )?.name || "Staff";
          
          generatedRoutine[day][slot] = {
            type: "lab",
            lab: `Lab ${labNumber}`,
            subject: subject,
            teacher: labTeacher,
            semester: semester
          };
        } else {
          // Regular classes - assign based on day and time
          const hour = parseInt(slot.split(':')[0]);
          let semester, subjectIndex;
          
          if (hour < 11) {
            // Morning classes - 1st Semester
            semester = "1st Semester";
            subjectIndex = day.charCodeAt(0) % semesters.find(s => s.name === semester).subjects.length;
          } else if (hour < 13) {
            // Late morning classes - 3rd Semester
            semester = "3rd Semester";
            subjectIndex = (day.charCodeAt(0) + 1) % semesters.find(s => s.name === semester).subjects.length;
          } else {
            // Afternoon classes before labs - 5th Semester
            semester = "5th Semester";
            subjectIndex = (day.charCodeAt(0) + 2) % semesters.find(s => s.name === semester).subjects.length;
          }
          
          const subject = semesters.find(s => s.name === semester)?.subjects[subjectIndex] || "Subject";
          
          // Find teacher for this subject and semester
          const classTeacher = teachers.find(t => 
            t.subjects.some(s => s.name === subject && s.semester === semester)
          )?.name || "Staff";
          
          generatedRoutine[day][slot] = {
            type: "class",
            classroom: `Room ${(day.charCodeAt(0) % classrooms) + 1}`,
            subject: subject,
            teacher: classTeacher,
            semester: semester
          };
        }
      });
    });
    
    setRoutine(generatedRoutine);
    setActiveTab("routine");
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Computer Science Department Routine Generator</h1>
        <p>Easily manage and generate class schedules for 1st, 3rd, and 5th semesters</p>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === "config" ? "active" : ""} 
          onClick={() => setActiveTab("config")}
        >
          Configuration
        </button>
        <button 
          className={activeTab === "routine" ? "active" : ""} 
          onClick={() => setActiveTab("routine")}
          disabled={!routine}
        >
          Generated Routine
        </button>
      </div>

      {activeTab === "config" ? (
        <div className="configuration">
          <div className="input-section">
            <h2>College Infrastructure</h2>
            <div className="input-group">
              <label>Number of Classrooms:</label>
              <input 
                type="number" 
                value={classrooms} 
                onChange={(e) => setClassrooms(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
            
            <div className="input-group">
              <label>Number of Labs:</label>
              <input 
                type="number" 
                value={labs} 
                onChange={(e) => setLabs(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="input-section">
            <h2>Break Time</h2>
            <div className="time-input-group">
              <div className="input-group">
                <label>Start Time:</label>
                <input 
                  type="time" 
                  value={breakTime.start} 
                  onChange={(e) => setBreakTime({...breakTime, start: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>End Time:</label>
                <input 
                  type="time" 
                  value={breakTime.end} 
                  onChange={(e) => setBreakTime({...breakTime, end: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="input-section">
            <h2>Lab Timings (2 hours each)</h2>
            {labTimings.map((timing, index) => (
              <div key={timing.id} className="time-input-group">
                <div className="input-group">
                  <label>Lab {index + 1} Start:</label>
                  <input 
                    type="time" 
                    value={timing.start} 
                    onChange={(e) => {
                      const newTimings = [...labTimings];
                      newTimings[index].start = e.target.value;
                      setLabTimings(newTimings);
                    }}
                  />
                </div>
                <div className="input-group">
                  <label>Lab {index + 1} End:</label>
                  <input 
                    type="time" 
                    value={timing.end} 
                    onChange={(e) => {
                      const newTimings = [...labTimings];
                      newTimings[index].end = e.target.value;
                      setLabTimings(newTimings);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="input-section">
            <h2>Teachers and Subjects</h2>
            <div className="teacher-input">
              <div className="input-group">
                <label>Teacher Name:</label>
                <input 
                  type="text" 
                  value={newTeacher.name} 
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  placeholder="Enter teacher's name"
                />
              </div>
              <div className="input-group">
                <label>Subject:</label>
                <input 
                  type="text" 
                  value={newTeacher.subject} 
                  onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                  placeholder="Enter subject"
                />
              </div>
              <div className="input-group">
                <label>Semester:</label>
                <select 
                  value={newTeacher.semester} 
                  onChange={(e) => setNewTeacher({...newTeacher, semester: e.target.value})}
                >
                  <option value="">Select Semester</option>
                  {semesters.map(sem => (
                    <option key={sem.id} value={sem.name}>{sem.name}</option>
                  ))}
                </select>
              </div>
              <button className="add-teacher-btn" onClick={addTeacher}>Add Assignment</button>
            </div>
            
            <div className="teachers-list">
              <h3>Teacher Assignments</h3>
              {teachers.length === 0 ? (
                <p>No teachers added yet</p>
              ) : (
                <div className="teacher-cards">
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="teacher-card">
                      <h4>{teacher.name}</h4>
                      <div className="subjects-list">
                        {teacher.subjects.map((subject, index) => (
                          <div key={index} className="subject-assignment">
                            <span>{subject.name} ({subject.semester})</span>
                            <button 
                              className="remove-subject-btn"
                              onClick={() => removeSubject(teacher.id, index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="remove-teacher-btn"
                        onClick={() => removeTeacher(teacher.id)}
                      >
                        Remove Teacher
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="input-section">
            <h2>Semesters and Subjects</h2>
            <div className="semester-cards">
              {semesters.map(sem => (
                <div key={sem.id} className="semester-card">
                  <h3>{sem.name}</h3>
                  <div className="subjects-list">
                    {sem.subjects.map((subject, index) => (
                      <span key={index} className="subject-tag">{subject}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="generate-btn" onClick={generateRoutine}>
            Generate Routine
          </button>
        </div>
      ) : (
        <div className="routine-view">
          <h2>Weekly Class Routine - Computer Science Department</h2>
          {routine && (
            <div className="routine-table">
              {Object.entries(routine).map(([day, schedule]) => (
                <div key={day} className="day-schedule">
                  <h3>{day}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Time Slot</th>
                        <th>Type</th>
                        <th>Room/Lab</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(schedule).map(([time, detail]) => (
                        <tr key={time} className={detail.type}>
                          <td>{time}</td>
                          <td>{detail.type === "break" ? "Break" : detail.type === "lab" ? "Lab" : "Class"}</td>
                          <td>{detail.type === "break" ? "-" : detail.classroom || detail.lab}</td>
                          <td>{detail.type === "break" ? "Break Time" : detail.subject}</td>
                          <td>{detail.type === "break" ? "-" : detail.teacher}</td>
                          <td>{detail.type === "break" ? "-" : detail.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;