import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './landingpage';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import SimpleEditorPage from './pages/SimpleEditorPage';
import ContestList from './pages/ContestList';
import ContestDetails from './pages/ContestDetails';
import ProblemPage from './pages/ProblemPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
    return (
        <>
            <div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        success: {
                            theme: {
                                primary: '#4aed88',
                            },
                        },
                    }}
                ></Toaster>
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />}></Route>
                    <Route path="/home" element={<Home />}></Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                        path="/editor/:roomId"
                        element={<EditorPage />}
                    ></Route>
                    <Route path="/simple-editor" element={<SimpleEditorPage />}></Route>
                    <Route path="/contests" element={<ContestList />}></Route>
                    <Route path="/contests/:contestId" element={<ContestDetails />}></Route>
                    <Route path="/contests/:contestId/problems/:problemId" element={<ProblemPage />}></Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
