"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from "framer-motion";

export interface CollectionItem {
    id: number;
    image: string;
    title: string;
}

export type CollectionSurferVariant = "magnetic" | "uplift" | "simple";

// Default items for the component in case none are provided
const ITEMS: CollectionItem[] = [
    { id: 1, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", title: "HERITAGE 01" },
    { id: 2, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80", title: "HERITAGE 02" },
    { id: 3, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80", title: "HERITAGE 03" },
    { id: 4, image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80", title: "HERITAGE 04" },
    { id: 5, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80", title: "HERITAGE 05" },
    { id: 6, image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80", title: "HERITAGE 06" },
    { id: 7, image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80", title: "HERITAGE 07" },
    { id: 8, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80", title: "HERITAGE 08" },
    { id: 9, image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&q=80", title: "HERITAGE 09" },
    { id: 10, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80", title: "HERITAGE 10" },
    { id: 11, image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80", title: "HERITAGE 11" },
    { id: 12, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80", title: "HERITAGE 12" },
    { id: 13, image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80", title: "HERITAGE 13" },
    { id: 14, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80", title: "HERITAGE 14" },
    { id: 15, image: "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=800&q=80", title: "HERITAGE 15" },
    { id: 16, image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=800&q=80", title: "HERITAGE 16" },
];

interface CollectionSurferProps {
    items?: CollectionItem[];
    variant?: CollectionSurferVariant;
    progress?: number;
    embedded?: boolean;
    showOverlay?: boolean;
    stepX?: number;
    stepY?: number;
    stepZ?: number;
    cardWidth?: number;
    cardHeight?: number;
    sceneOffsetX?: number;
    sceneOffsetY?: number;
    perspectiveOrigin?: string;
}

export function CollectionSurfer({
    items = ITEMS,
    variant = "magnetic",
    progress,
    embedded = false,
    showOverlay = true,
    stepX = 240,
    stepY = -84,
    stepZ = -288,
    cardWidth = 300,
    cardHeight = 400,
    sceneOffsetX = 0,
    sceneOffsetY = 0,
    perspectiveOrigin = "10% 10%"
}: CollectionSurferProps) {
    const duplicatedItems = [...items, ...items];

    const scrollPerItem = 600;
    const loopDistance = items.length * scrollPerItem;

    const { scrollY } = useScroll();
    const externalDriver = useMotionValue(0);

    useEffect(() => {
        if (progress !== undefined) {
            externalDriver.set(progress * loopDistance);
        }
    }, [progress, externalDriver, loopDistance]);

    const driver: MotionValue<number> = progress !== undefined ? externalDriver : scrollY;

    const smoothScroll = useSpring(driver, {
        mass: 0.1,
        stiffness: 100,
        damping: 20
    });

    const loopedProgress = useTransform(smoothScroll, (value) => value % loopDistance);

    // We only move the scene backwards by the length of ONE set of items
    const x = useTransform(loopedProgress, [0, loopDistance], [0, -items.length * stepX]);
    const y = useTransform(loopedProgress, [0, loopDistance], [0, -items.length * stepY]);
    const z = useTransform(loopedProgress, [0, loopDistance], [0, -items.length * stepZ]);

    // Mouse position for magnetic effect
    // Initialize off-screen so no card is scaled by default
    const mouseX = useMotionValue(-10000);
    const mouseY = useMotionValue(-10000);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (variant === "simple") return;
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
        if (variant === "simple") return;
        mouseX.set(-10000);
        mouseY.set(-10000);
    };

    const outerClass = embedded
        ? "relative w-full h-full"
        : "relative bg-black min-h-screen text-white w-full";

    const viewportClass = embedded
        ? "absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center perspective-container"
        : "fixed inset-0 w-full h-screen overflow-hidden flex items-center justify-center perspective-container";

    return (
        <div className={outerClass}>
            {!embedded && <div style={{ height: "50000px" }} className="w-full" />}

            <div
                className={viewportClass}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {showOverlay && (
                    <>
                        <div className="absolute top-[3vw] left-[3vw] z-50 pointer-events-none mix-blend-difference">
                            <h1 className="font-heading font-bold text-[clamp(2rem,6vw,5rem)] leading-[0.9] tracking-tighter ml-[4vw]">
                                HERITAGE FW25/26
                            </h1>
                            <h1 className="font-heading font-bold text-[clamp(2rem,6vw,5rem)] leading-[0.9] tracking-tighter">
                                COLLECTION
                                <span className="text-[0.4em] align-top relative top-[0.6em] ml-2 font-mono tabular-nums">
                                    ({items.length})
                                </span>
                            </h1>
                        </div>

                        <div className="absolute bottom-[3vw] right-[3vw] z-50 font-mono text-xs tracking-wider uppercase opacity-70">
                            scroll to surf
                        </div>
                    </>
                )}

                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        perspective: "2000px",
                        perspectiveOrigin,
                        transform: `translate3d(${sceneOffsetX}px, ${sceneOffsetY}px, 0)`
                    }}
                >
                    <motion.div
                        className="relative w-0 h-0"
                        style={{
                            x,
                            y,
                            z,
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {duplicatedItems.map((item, i) => (
                            <Card
                                key={`${item.id}-${i}`}
                                item={item}
                                i={i}
                                stepX={stepX}
                                stepY={stepY}
                                stepZ={stepZ}
                                mouseX={mouseX}
                                mouseY={mouseY}
                                scrollSpring={smoothScroll}
                                variant={variant}
                                cardWidth={cardWidth}
                                cardHeight={cardHeight}
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function Card({
    item,
    i,
    stepX,
    stepY,
    stepZ,
    mouseX,
    mouseY,
    scrollSpring,
    variant,
    cardWidth,
    cardHeight
}: {
    item: CollectionItem,
    i: number,
    stepX: number,
    stepY: number,
    stepZ: number,
    mouseX: MotionValue<number>,
    mouseY: MotionValue<number>,
    scrollSpring: MotionValue<number>,
    variant: CollectionSurferVariant,
    cardWidth: number,
    cardHeight: number
}) {
    const ref = useRef<HTMLDivElement>(null);

    // Calculate distance from mouse to center of card
    const distance = useTransform([mouseX, mouseY, scrollSpring], ([x, y]) => {
        if (!ref.current || variant === "simple") return 200; // Default large distance
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return dist;
    });

    // --- Magnetic Variant ---
    // Map distance to scale: Closer = larger
    const targetScale = useTransform(distance, [0, 400], [1.5, 1]);
    const springScale = useSpring(targetScale, {
        mass: 0.5,
        stiffness: 300,
        damping: 20
    });

    // --- Uplift Variant ---
    // Map distance to Y uplift: Closer = move up (negative Y)
    const targetUplift = useTransform(distance, [0, 400], [-100, 0]);
    const springUplift = useSpring(targetUplift, {
        mass: 0.5,
        stiffness: 300,
        damping: 20
    });

    // Combine transforms based on variant
    const transform = useTransform(
        [springScale, springUplift],
        ([s, u]) => {
            let scaleValue = 1;
            let upliftValue = 0;

            if (variant === "magnetic") {
                scaleValue = Number(s);
            } else if (variant === "uplift") {
                upliftValue = Number(u);
            }

            const baseX = i * stepX;
            const baseY = i * stepY;
            const baseZ = i * stepZ;

            return `translate3d(${baseX}px, ${baseY + upliftValue}px, ${baseZ}px) rotateY(-50deg) scale(${scaleValue})`;
        }
    );

    return (
        <motion.div
            ref={ref}
            className="absolute bg-neutral-900 overflow-hidden shadow-2xl transition-colors duration-500 ease-out group"
            style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                transform,
                transformStyle: "preserve-3d",
            }}
        >
            {/* Index number: Using i % 16 + 1 so the duplicate cards show correct numbers (01-16) */}
            <div className="absolute -top-6 -left-4 text-white font-mono text-xs opacity-50 transition-opacity group-hover:opacity-100">
                {String((i % 16) + 1).padStart(2, '0')}
            </div>

            {/* Image */}
            <div className="relative w-full h-full brightness-75 group-hover:brightness-100 transition-all duration-300">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
        </motion.div>
    );
}
