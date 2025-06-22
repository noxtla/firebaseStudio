const AppHeader = () => {
  return (
    <h1
      className="font-black uppercase font-heading"
      style={{
        color: 'hsl(var(--primary))',
        // Responsive font size
        fontSize: 'clamp(2rem, 8vw, 4.5rem)',
      }}
    >
      Tree Services
    </h1>
  );
};

export default AppHeader;