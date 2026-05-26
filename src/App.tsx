import style from "./app.module.scss";
import FanMenu from "./components/fan-menu";

function App() {
  return (
    <div className={style.app}>
      <FanMenu />
    </div>
  );
}

export default App;
