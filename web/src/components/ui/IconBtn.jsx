import { motion } from "framer-motion";

const IconBtn = ({
    icon,
    badge = false,
    pulse = false,
    spin = false,
    onClick,
    label,
}) => {
    return (
    <motion.button
        type="button"
        aria-label={label}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="
        relative w-8 h-8 flex items-center justify-center
        rounded-full
        bg-white/[0.06]
        border border-white/10
        text-white/60
        hover:bg-white/10
        hover:text-white
        focus:outline-none
        focus:ring-2 focus:ring-blue-500/40
        transition-colors
        "
    >
      {/* Icon animation */}
        <motion.span
        animate={
            spin
            ? { rotate: 360 }
            : pulse
            ? { scale: [1, 1.15, 1] }
            : {}
        }
        transition={
            spin
            ? { duration: 0.8, ease: "easeInOut" }
            : pulse
            ? { duration: 1.5, repeat: Infinity }
            : {}
        }
        >
        {icon}
        </motion.span>

      {/* Notification badge */}
        {badge && (
        <motion.span
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-400"
            animate={pulse ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden
        />
        )}
    </motion.button>
    );
};

export default IconBtn;