import { Navbar } from './Navbar';

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}
