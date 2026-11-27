
import { useState } from 'react';

const students = [
  { id: 1, name: 'Anu', course: 'CSE' },
  { id: 2, name: 'Ravi', course: 'ECE' },
  { id: 3, name: 'Meera', course: 'CSE' }
];

function StudentCard({ name, course }) {
  return (
    <li>
      {name} - {course}
    </li>
  );
}

export default function App() {
  const [search, setSearch] = useState('');

  const filtered = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1>Student Dashboard</h1>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search student"
      />

      <ul>
        {filtered.map(student => (
          <StudentCard
            key={student.id}
            name={student.name}
            course={student.course}
          />
        ))}
      </ul>
    </div>
  );
}
