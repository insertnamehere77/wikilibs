import './App.css';
import Article from './article';
import { Navbar } from './navbar';
import About from './about';

const routes = [
  {
    title: 'About',
    path: '/about',
    component: <About />
  },
  {
    title: 'Random article',
    path: '/random',
    component: <Article />
  }
];

function App(): JSX.Element {
  return (
    <div className="App">
      <Navbar routes={routes} defaultRoute={routes[0]} />

    </div >
  );
}

export default App;
