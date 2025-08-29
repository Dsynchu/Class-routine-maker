import React, { useState } from 'react';
import './App.css';

function App() {
  // State management
  const [classrooms, setClassrooms] = useState(3);
  const [labs, setLabs] = useState(2);
  const [teachers, setTeachers] = useState([
    { 
      id: 1, 
      name: "MD", 
      subjects: [
        { name: "C Programming", semester: "1st Semester" },
        { name: "Operating System", semester: "3rd Semester" },
        { name: "Networking", semester: "5th Semester" }
      ] 
    },
    { 
      id: 2, 
      name: "RP", 
      subjects: [
        { name: "Maths", semester: "1st Semester" },
        { name: "DBMS", semester: "3rd Semester" }
      ] 
    },
    { 
      id: 3, 
      name: "RB", 
      subjects: [
        { name: "English", semester: "1st Semester" },
        { name: "Indian Constitution", semester: "3rd Semester" },
        { name: "AI", semester: "5th Semester" }
      ] 
    },
    { 
      id: 4, 
      name: "FZ", 
      subjects: [
        { name: "Entrepreneurship", semester: "1st Semester" },
        { name: "Python", semester: "3rd Semester" },
        { name: "Python", semester: "5th Semester" }
      ] 
    },
    { 
      id: 5, 
      name: "Maki", 
      subjects: [
        { name: "History", semester: "1st Semester" },
        { name: "Software", semester: "3rd Semester" },
        { name: "Software", semester: "5th Semester" }
      ] 
    },
    { 
      id: 6, 
      name: "Other", 
      subjects: [
        { name: "SEC", semester: "1st Semester" },
        { name: "Feature Engineering", semester: "3rd Semester" },
        { name: "Networking", semester: "5th Semester" }
      ] 
    }
  ]);
  const [semesters] = useState([
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
  const [breakTime] = useState({ start: "11:00", end: "11:30" });
  const [labTimings] = useState([
    { id: 1, start: "14:00", end: "16:00" },
    { id: 2, start: "15:00", end: "17:00" }
  ]);
  const [routines, setRoutines] = useState({});
  const [activeTab, setActiveTab] = useState("config");
  const [newTeacher, setNewTeacher] = useState({ name: "", subject: "", semester: "" });
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");

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

  // Generate routine for all semesters with proper resource allocation
  const generateRoutines = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
      "9:00-10:00", "10:00-11:00", "11:00-11:30", "11:30-12:30", 
      "12:30-13:30", "14:00-16:00", "15:00-17:00"
    ];
    
    const allRoutines = {};
    const resourceAllocation = {
      classrooms: Array(classrooms).fill().map((_, i) => ({
        id: i + 1,
        availability: days.reduce((acc, day) => {
          acc[day] = timeSlots.reduce((timeAcc, time) => {
            timeAcc[time] = true;
            return timeAcc;
          }, {});
          return acc;
        }, {})
      })),
      labs: Array(labs).fill().map((_, i) => ({
        id: i + 1,
        availability: days.reduce((acc, day) => {
          acc[day] = timeSlots.reduce((timeAcc, time) => {
            timeAcc[time] = true;
            return timeAcc;
          }, {});
          return acc;
        }, {})
      }))
    };

    // Generate routine for each semester
    semesters.forEach(semester => {
      const semesterRoutine = {};
      
      days.forEach(day => {
        semesterRoutine[day] = {};
        
        timeSlots.forEach(slot => {
          if (slot === "11:00-11:30") {
            semesterRoutine[day][slot] = { type: "break", description: "Break Time" };
          } else if (slot === "14:00-16:00" || slot === "15:00-17:00") {
            // Lab sessions
            const labNumber = slot === "14:00-16:00" ? 1 : 2;
            let subject;
            
            if (semester.name === "1st Semester") {
              subject = "C Programming Lab";
            } else if (semester.name === "3rd Semester") {
              subject = "Python Lab";
            } else {
              subject = "Networking Lab";
            }
            
            // Find available lab
            const availableLab = resourceAllocation.labs.find(lab => 
              lab.availability[day][slot]
            );
            
            if (availableLab) {
              // Mark lab as occupied
              availableLab.availability[day][slot] = false;
              
              // Find teacher for this lab
              const labTeacher = teachers.find(t => 
                t.subjects.some(s => s.name.includes(subject.split(' ')[0]) && s.semester === semester.name)
              )?.name || "Staff";
              
              semesterRoutine[day][slot] = {
                type: "lab",
                lab: `Lab ${availableLab.id}`,
                subject: subject,
                teacher: labTeacher,
                semester: semester.name
              };
            } else {
              semesterRoutine[day][slot] = {
                type: "free",
                description: "No lab available"
              };
            }
          } else {
            // Regular classes
            const hour = parseInt(slot.split(':')[0]);
            let subjectIndex;
            
            if (hour < 11) {
              subjectIndex = (days.indexOf(day) * 2) % semester.subjects.length;
            } else if (hour < 13) {
              subjectIndex = (days.indexOf(day) * 2 + 1) % semester.subjects.length;
            } else {
              subjectIndex = (days.indexOf(day) * 2 + 2) % semester.subjects.length;
            }
            
            const subject = semester.subjects[subjectIndex];
            
            // Find available classroom
            const availableClassroom = resourceAllocation.classrooms.find(
              classroom => classroom.availability[day][slot]
            );
            
            if (availableClassroom) {
              // Mark classroom as occupied
              availableClassroom.availability[day][slot] = false;
              
              // Find teacher for this subject and semester
              const classTeacher = teachers.find(t => 
                t.subjects.some(s => s.name === subject && s.semester === semester.name)
              )?.name || "Staff";
              
              semesterRoutine[day][slot] = {
                type: "class",
                classroom: `Room ${availableClassroom.id}`,
                subject: subject,
                teacher: classTeacher,
                semester: semester.name
              };
            } else {
              semesterRoutine[day][slot] = {
                type: "free",
                description: "No classroom available"
              };
            }
          }
        });
      });
      
      allRoutines[semester.name] = semesterRoutine;
    });
    
    setRoutines(allRoutines);
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
          disabled={Object.keys(routines).length === 0}
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
                  readOnly
                />
              </div>
              <div className="input-group">
                <label>End Time:</label>
                <input 
                  type="time" 
                  value={breakTime.end} 
                  readOnly
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
                    readOnly
                  />
                </div>
                <div className="input-group">
                  <label>Lab {index + 1} End:</label>
                  <input 
                    type="time" 
                    value={timing.end} 
                    readOnly
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

          <button className="generate-btn" onClick={generateRoutines}>
            Generate All Routines
          </button>
        </div>
      ) : (
        <div className="routine-view">
          <h2>Weekly Class Routines - Computer Science Department</h2>
          
          <div className="semester-selector">
            <label>Select Semester: </label>
            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.name}>{sem.name}</option>
              ))}
            </select>
          </div>
          
          {routines[selectedSemester] && (
            <div className="routine-table">
              <h3>{selectedSemester} Routine</h3>
              {Object.entries(routines[selectedSemester]).map(([day, schedule]) => (
                <div key={day} className="day-schedule">
                  <h4>{day}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Time Slot</th>
                        <th>Type</th>
                        <th>Room/Lab</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(schedule).map(([time, detail]) => (
                        <tr key={time} className={detail.type}>
                          <td>{time}</td>
                          <td>{detail.type === "break" ? "Break" : detail.type === "lab" ? "Lab" : detail.type === "free" ? "Free" : "Class"}</td>
                          <td>{detail.type === "break" ? "-" : detail.classroom || detail.lab || "-"}</td>
                          <td>{detail.type === "break" ? "Break Time" : detail.subject || detail.description}</td>
                          <td>{detail.type === "break" || detail.type === "free" ? "-" : detail.teacher}</td>
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