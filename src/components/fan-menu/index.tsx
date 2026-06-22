import React, {
  useState,
  useRef,
  useLayoutEffect,
  type PropsWithChildren,
  useEffect,
  useMemo,
} from "react";
import { motion, AnimatePresence, arc } from "motion/react";
import { createPortal } from "react-dom";
import {
  Plus,
  BookOpen,
  FileText,
  Music2,
  Clapperboard,
  Image,
  type LucideIcon,
} from "lucide-react";
import style from "./fan-menu.module.scss";

const Portal = ({ children }: PropsWithChildren) =>
  createPortal(children, document.body);

const buttons: { text: string; icon: LucideIcon }[] = [
  {
    text: "Image",
    icon: Image,
  },
  {
    text: "Video",
    icon: Clapperboard,
  },
  {
    text: "Music",
    icon: Music2,
  },
  {
    text: "Document",
    icon: FileText,
  },
  {
    text: "Learning",
    icon: BookOpen,
  },
];

const getRect = (node: HTMLElement) => node.getBoundingClientRect();

const MENU_RADIUS = 220;
const Y_OFFSET_FROM_TOGGLE = 0;

interface Geometry {
  top: number;
  left: number;
  // toggle's center y
  tcy: number;
}

function Button({
  children,
  geometry: g,
  index,
}: React.PropsWithChildren<{
  index: number;
  geometry: Geometry;
}>) {
  const [box, setBox] = useState<DOMRect>(new DOMRect());
  const ref = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const r = getRect(ref.current!);
    setBox(r);
  }, []);

  const dest = useMemo(() => {
    const deg = index * 20 * (Math.PI / 180);

    const ox = g.left - MENU_RADIUS;
    const oy = g.top - Y_OFFSET_FROM_TOGGLE;

    const destX = ox + Math.cos(deg) * MENU_RADIUS;
    const destY = oy - Math.sin(deg) * MENU_RADIUS;

    return {
      x: destX - box.left,
      y: destY - box.bottom,
      r: -deg,
    };
  }, [box, g]);

  const motionPath = useMemo(() => {
    const chord = Math.hypot(dest.x, dest.y);
    const hOfChord =
      MENU_RADIUS -
      Math.sqrt(Math.pow(MENU_RADIUS, 2) - Math.pow(chord / 2, 2));

    const common = {
      strength: hOfChord / chord,
      peak: 0.5,
      rotate: true,
    };

    return {
      enter: arc({ ...common, direction: "ccw" }),
      exit: arc({ ...common, direction: "cw" }),
    };
  }, [dest]);

  return (
    <motion.button
      ref={ref}
      style={{
        position: "fixed",
        top: g.tcy - box.height / 2,
        left: g.left,
      }}
      className={style.button}
      transition={{
        duration: 1,
        type: "spring",
      }}
      animate={{
        x: dest.x,
        y: dest.y,
        // rotate: dest.r,
        transition: {
          inherit: true,
          path: motionPath.enter,
        },
      }}
      exit={{
        x: 0,
        y: 0,
        // rotate: 0,
        transition: {
          inherit: true,
          path: motionPath.exit,
        },
      }}
    >
      {children}
    </motion.button>
  );
}

export default function FanMenu() {
  const [opened, setOpened] = useState(false);
  const [geometry, setGeometry] = useState<Geometry>({
    top: 0,
    left: 0,
    tcy: 0,
  });
  const toggle = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const { top, left, height } = getRect(toggle.current!);
    setGeometry({ top, left, tcy: top + height / 2 });
  }, []);

  return (
    <>
      <button
        onClick={() => setOpened(!opened)}
        className={style.toggle}
        ref={toggle}
      >
        <Plus className={style.toggleIcon} />
      </button>
      <Portal>
        <AnimatePresence>
          {opened && (
            <div>
              {buttons.map((button, index) => (
                <Button key={index} index={index} geometry={geometry}>
                  <button.icon />
                  {button.text}
                </Button>
              ))}
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
