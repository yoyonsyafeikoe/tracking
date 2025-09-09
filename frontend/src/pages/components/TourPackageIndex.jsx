import { useState } from "react";
import TourPackageList from "./TourPackageList";
import TourPackagePage from "./TourPackagePage";

export default function TourPackageIndex() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null); 

  return (
    <div>
      {showAddForm || editingPackage ? (
        <TourPackagePage
          onBack={() => {
            setShowAddForm(false);
            setEditingPackage(null);
          }}
          initialData={editingPackage}
        />
      ) : (
        <TourPackageList
          onAdd={() => setShowAddForm(true)}
          onEdit={(pkg) => setEditingPackage(pkg)}
        />
      )}
    </div>
  );
}

