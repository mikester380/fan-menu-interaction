import React, {
  useState,
  useRef,
  useLayoutEffect,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useCallback,
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

const MENU_RADIUS = 300;
const Y_OFFSET_FROM_TOGGLE = 20;

interface Geometry {
  top: number;
  left: number;
  // toggle's center y
  tcy: number;
}

const MotionPlus = motion.create(Plus);

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

  const startX = g.left;
  const startY = g.tcy - box.height / 2;

  const dest = useMemo(() => {
    const deg = index * 13 * (Math.PI / 180);

    const ox = g.left - MENU_RADIUS;
    const oy = g.top - Y_OFFSET_FROM_TOGGLE;

    const destX = ox + Math.cos(deg) * MENU_RADIUS;
    const destY = oy - Math.sin(deg) * MENU_RADIUS;

    return {
      x: destX - startX,
      y: destY - (startY + box.height),
      // slight rotation
      r: index * -7,
      // r: -(deg / (Math.PI * 2)) * 360,
    };
  }, [g, startX, startY, box.height, index]);

  const motionPath = useMemo(() => {
    const chord = Math.hypot(dest.x, dest.y);
    const hOfChord =
      MENU_RADIUS -
      Math.sqrt(Math.pow(MENU_RADIUS, 2) - Math.pow(chord / 2, 2));

    const arcCommon = {
      strength: hOfChord / chord,
      peak: 0.5,
    };

    return {
      enter: arc({ ...arcCommon, direction: "ccw" }),
      exit: arc({ ...arcCommon, direction: "cw" }),
    };
  }, [dest]);

  return (
    <motion.button
      ref={ref}
      style={{
        position: "fixed",
        top: startY,
        left: startX,
      }}
      className={style.btn}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 22,
      }}
      initial={{
        filter: "blur(8px)",
        opacity: 0,
      }}
      animate={{
        x: dest.x,
        y: dest.y,
        rotate: dest.r,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          inherit: true,
          path: motionPath.enter,
        },
      }}
      exit={{
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 0,
        filter: "blur(8px)",
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
  const toggle = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const [geometry, setGeometry] = useState<Geometry>({
    top: 0,
    left: 0,
    tcy: 0,
  });

  useLayoutEffect(() => {
    const { top, left, height } = getRect(toggle.current!);
    setGeometry({
      tcy: top + height / 2,
      top,
      left,
    });
  }, []);

  return (
    <>
      <button
        onClick={() => setOpened(!opened)}
        className={style.toggle}
        ref={toggle}
      >
        <MotionPlus
          className={style.toggleIcon}
          animate={{
            rotate: opened ? -45 : 0,
            transition: {
              ease: "easeInOut",
              duration: 0.2,
            },
          }}
        />
      </button>
      <Portal>
        <AnimatePresence>
          {opened && (
            <div>
              {buttons.map((button, index) => (
                <Button key={index} index={index} geometry={geometry}>
                  <button.icon className={style.btnIcon} />
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
