
export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="container py-8 text-sm text-gray-500">
        <p>
          MADSPACE is an independent and unofficial website not affiliated with or maintained by the University of Wisconsin–Madison.
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} MADSPACE Community</p>
      </div>
    </footer>
  );
}
