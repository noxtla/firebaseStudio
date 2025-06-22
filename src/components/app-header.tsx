import Link from 'next/link';

const AppHeader = () => {
  return (
    <Link href="/main-menu" className="text-center no-underline">
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
    </Link>
  );
};

export default AppHeader;