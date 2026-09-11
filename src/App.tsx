import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DetailThread from "./component/detailThread/index";
import MainLayout from "./layouts/MainLayout";
import Follows from "./pages/follows/index";
import Home from "./pages/home/index";
import Login from "./pages/login/index";
import NotFound from "./pages/notFound/NotFound";
import Profile from "./pages/profile/index";
import Register from "./pages/register/index";
import CompleteProfile from "./pages/completeProfile/index";
import Search from "./pages/search/index";
import Chat from "./pages/chat/index";
import ChatRoom from "./pages/chatRoom/index";
import Notifications from "./pages/notifications/index";
import { Navigate, Outlet } from "react-router-dom";

function IsNotLogin() {
  if (sessionStorage.token) {
    return <Navigate to={"/"} />;
  } else {
    return <Outlet />;
  }
}

// Kebalikan dari IsNotLogin. Chat tidak punya versi publik sama sekali, jadi
// tanpa ini halamannya cuma memicu rentetan 403 dan tampil kosong tanpa sebab.
function IsLogin() {
  if (!sessionStorage.token) {
    return <Navigate to={"/login"} />;
  } else {
    return <Outlet />;
  }
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/follows" element={<Follows />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/details/:id" element={<DetailThread />} />

          <Route path="/" element={<IsLogin />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<ChatRoom />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route path="/" element={<IsNotLogin />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
