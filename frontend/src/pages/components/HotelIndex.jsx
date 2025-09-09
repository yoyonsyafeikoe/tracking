export default function HotelIndex() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  if (showAddForm || editingHotel) {
    return (
      <HotelPage
        onBack={() => {
          setShowAddForm(false);
          setEditingHotel(null);
        }}
        initialData={editingHotel}
      />
    );
  }

  return (
    <HotelList
      onAdd={() => setShowAddForm(true)}
      onEdit={(hotel) => setEditingHotel(hotel)}
    />
  );
}
