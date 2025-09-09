import { useState } from "react";
import TourJobList from "./TourJobList";
import TourJobPage from "./TourJobPage";

export default function TourJobIndex() {
  const [view, setView] = useState("list");
  const [editingJob, setEditingJob] = useState(null);

  return (
    <div>
      {editingJob ? (
        <TourJobPage
          initialData={editingJob}
          onBack={() => {
            setView("list");
            setEditingJob(null);
          }}
        />
      ) : view === "add" ? (
        <TourJobPage onBack={() => setView("list")} />
      ) : (
        <TourJobList
          onAdd={() => setView("add")}
          onEdit={(job) => setEditingJob(job)}
        />
      )}
    </div>
  );
}
