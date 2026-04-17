"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function HouseholdProfileManager() {
  const { data: session } = useSession();
  const [householdName, setHouseholdName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");

  if (!session) {
    return <p>Loading...</p>;
  }

  function handleAddMember() {
    if (newMember.trim()) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  }

  function handleRemoveMember(index: number) {
    setMembers(members.filter((_, i) => i !== index));
  }

  return (
    <section>
      <h2>Household Profile</h2>
      <label>
        Household Name:
        <input
          type="text"
          value={householdName}
          onChange={e => setHouseholdName(e.target.value)}
          placeholder="e.g. The Smiths"
        />
      </label>
      <h3>Members</h3>
      <ul>
        {members.map((member, idx) => (
          <li key={idx}>
            {member} <button type="button" onClick={() => handleRemoveMember(idx)}>Remove</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newMember}
        onChange={e => setNewMember(e.target.value)}
        placeholder="Add member email"
      />
      <button type="button" onClick={handleAddMember}>Add Member</button>
    </section>
  );
}
