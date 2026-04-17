import { useState } from "react";

export default function RoutineTemplates({ onSave }) {
  const [routineName, setRoutineName] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");
  const [savedRoutines, setSavedRoutines] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("domestiq-ai-routines");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  function addStep() {
    if (newStep.trim()) {
      setSteps([...steps, newStep.trim()]);
      setNewStep("");
    }
  }

  function removeStep(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx));
  }

  function saveRoutine() {
    if (!routineName.trim() || steps.length === 0) return;
    const routine = { name: routineName.trim(), steps };
    const updated = [...savedRoutines, routine];
    setSavedRoutines(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("domestiq-ai-routines", JSON.stringify(updated));
    }
    setRoutineName("");
    setSteps([]);
    if (onSave) onSave(routine);
  }

  function loadRoutine(idx: number) {
    const routine = savedRoutines[idx];
    setRoutineName(routine.name);
    setSteps(routine.steps);
  }

  function shareRoutine(idx: number) {
    const routine = savedRoutines[idx];
    const text = `Routine: ${routine.name}\nSteps:\n- ${routine.steps.join("\n- ")}`;
    if (navigator.share) {
      navigator.share({ title: routine.name, text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Routine copied to clipboard!");
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Custom Routines & Templates</h2>
      <div>
        <input
          type="text"
          placeholder="Routine Name"
          value={routineName}
          onChange={e => setRoutineName(e.target.value)}
        />
        <div style={{ margin: "8px 0" }}>
          <input
            type="text"
            placeholder="Add step"
            value={newStep}
            onChange={e => setNewStep(e.target.value)}
          />
          <button type="button" onClick={addStep}>Add Step</button>
        </div>
        <ul>
          {steps.map((step, idx) => (
            <li key={idx}>{step} <button type="button" onClick={() => removeStep(idx)}>Remove</button></li>
          ))}
        </ul>
        <button type="button" onClick={saveRoutine} disabled={!routineName || steps.length === 0}>Save Routine</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3>Saved Routines</h3>
        <ul>
          {savedRoutines.map((routine, idx) => (
            <li key={idx}>
              <strong>{routine.name}</strong>
              <button type="button" onClick={() => loadRoutine(idx)}>Load</button>
              <button type="button" onClick={() => shareRoutine(idx)}>Share</button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
