import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Navbar />
      <div className="pt-16"> {/* Add padding for fixed navbar */}
        <Outlet />
      </div>
    </div>
  );
}

export default App;
