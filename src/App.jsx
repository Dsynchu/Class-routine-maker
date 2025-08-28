import React, { useState } from 'react';
import './App.css';

function App() {
  // State management
  const [classrooms, setClassrooms] = useState(2);
  const [labs, setLabs] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([
    { id: 1, name: "1st Semester", subjects: ["SEC", "C PROGRAMING", "MATH","ENTERPRENEURSHIP","HISTORY","ENGLISH"] },
    { id: 2, name: "2nd Semester", subjects: ["Dbms", "OS", "SOFTWARE","PYTHON","FEATURE ENGINEERING","INDIAN CONSTITUT"] },
    { id: 3, name: "3rd Semester", subjects: ["PYTHON", "NETWORKS", "SORFWARE","AI"] }
  ]);
  const [breakTime, setBreakTime] = useState({ start: "11:00", end: "11:30" });
  const [labTimings, setLabTimings] = useState([
    { id: 1, start: "14:00", end: "16:00" },
    { id: 2, start: "15:00", end: "17:00" },
    { id: 2, start: "15:00", end: "17:00" }
  ]);
  const [routine, setRoutine] = useState(null);
  const [activeTab, setActiveTab] = useState("config");
  const [newTeacher, setNewTeacher] = useState({ name: "", subject: "" });

  // Add a new teacher
  const addTeacher = () => {
    if (newTeacher.name && newTeacher.subject) {
      setTeachers([...teachers, { 
        id: teachers.length + 1, 
        name: newTeacher.name, 
        subject: newTeacher.subject 
      }]);
      setNewTeacher({ name: "", subject: "" });
    }
  };

  // Remove a teacher
  const removeTeacher = (id) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  };

  // Generate routine function
  const generateRoutine = () => {
    // This is a simplified version - in a real app, this would be a complex algorithm
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
          const semester = day === "Monday" || day === "Wednesday" ? "1st Semester" : 
                          day === "Tuesday" ? "2nd Semester" : "3rd Semester";
          const subject = semester === "1st Semester" ? "Programming Lab" :
                         semester === "2nd Semester" ? "Data Structures Lab" : "Web Technologies Lab";
          generatedRoutine[day][slot] = {
            type: "lab",
            lab: `Lab ${labNumber}`,
            subject: subject,
            teacher: teachers.find(t => t.subject.includes(subject.split(' ')[0]))?.name || "Staff",
            semester: semester
          };
        } else {
          // Regular classes
          const hour = parseInt(slot.split(':')[0]);
          const semester = hour < 12 ? "1st Semester" : hour < 14 ? "2nd Semester" : "3rd Semester";
          const subjectIndex = day.charCodeAt(0) % semesters.find(s => s.name === semester).subjects.length;
          const subject = semesters.find(s => s.name === semester).subjects[subjectIndex];
          
          generatedRoutine[day][slot] = {
            type: "class",
            classroom: `Room ${(day.charCodeAt(0) % classrooms) + 1}`,
            subject: subject,
            teacher: teachers.find(t => t.subject === subject)?.name || "Staff",
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
        <p>Easily manage and generate class schedules for all semesters</p>
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
            <h2>Lab Timings</h2>
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
            <h2>Teachers</h2>
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
              <button className="add-teacher-btn" onClick={addTeacher}>Add Teacher</button>
            </div>
            
            <div className="teachers-list">
              <h3>Added Teachers</h3>
              {teachers.length === 0 ? (
                <p>No teachers added yet</p>
              ) : (
                <ul>
                  {teachers.map(teacher => (
                    <li key={teacher.id}>
                      <span>{teacher.name} - {teacher.subject}</span>
                      <button onClick={() => removeTeacher(teacher.id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="input-section">
            <h2>Semesters and Subjects</h2>
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