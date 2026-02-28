/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, LogIn, Mail, Lock, Smile, AlertCircle, Home as HomeIcon, Users, Info, Scale, 
  BookOpen, Camera, Minimize, Maximize, ExternalLink, Sparkles, User, ArrowRight, 
  ArrowUp, Clock, Shield, Calendar, Filter, Check, Trash2, X, Tag, Minimize2, 
  Send, Loader2, Heart, Cloud, Star, CheckCircle, AlertTriangle, HelpCircle, 
  ChevronRight, MapPin, FileText, Phone, Zap, Music, Smile as SmileIcon, Sun, Code, Palette, 
  Monitor, Bus, Trophy, Briefcase, GraduationCap, Cog, School as SchoolIcon, 
  Building2, Settings, Moon, LogOut, ArrowLeft, Menu
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Html, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GoogleGenAI } from "@google/genai";

// --- Constants ---

const CATEGORIES = ['Clothing', 'Electronics', 'Books', 'Musical', 'Personal', 'Other'];
const ADMIN_PASSWORD = "8290";

const SCHOOL_THEMES: Record<string, any> = {
  will_east: {
    id: 'will_east', name: 'Williamsville East High School', logo: 'east.png',
    palette: { primary: '#ed1e25', secondary: '#f8ec24', tertiary: '#000000' },
    contactInfo: { address: '151 Paradise Rd, East Amherst, NY 14051', phone: '(716) 626-8400', email: 'eastoffice@williamsvillek12.org', principal: 'Mr. Brian Swatland' }
  },
  will_north: {
    id: 'will_north', name: 'Williamsville North High School', logo: 'north.png',
    palette: { primary: '#295236', secondary: '#ebe537', tertiary: '#b3a168' },
    contactInfo: { address: '1595 Hopkins Rd, Williamsville, NY 14221', phone: '(716) 626-8500', email: 'northoffice@williamsvillek12.org', principal: 'Mrs. Julie Barber' }
  },
  will_south: {
    id: 'will_south', name: 'Williamsville South High School', logo: 'south.png',
    palette: { primary: '#20366c', secondary: '#fbf9d2', tertiary: '#eaa55e' },
    contactInfo: { address: '5950 Main St, Williamsville, NY 14221', phone: '(716) 626-8200', email: 'southoffice@williamsvillek12.org', principal: 'Dr. Ryan M. Bialas' }
  },
  transit_middle: {
    id: 'transit_middle', name: 'Transit Middle School', logo: 'transit.png',
    palette: { primary: '#79242f', secondary: '#aca9b7', tertiary: '#000000' },
    contactInfo: { address: '8730 Transit Rd, East Amherst, NY 14051', phone: '(716) 626-8700', email: 'transitoffice@williamsvillek12.org', principal: 'Mr. Daniel Walh' }
  },
  mill_middle: {
    id: 'mill_middle', name: 'Mill Middle School', logo: 'mill.png',
    palette: { primary: '#264e99', secondary: '#b5badb', tertiary: '#000000' },
    contactInfo: { address: '8524 Mill St, Williamsville, NY 14221', phone: '(716) 626-8300', email: 'milloffice@williamsvillek12.org', principal: 'Mrs. Lasky' }
  },
  heim_middle: {
    id: 'heim_middle', name: 'Heim Middle School', logo: 'heim-middle.png',
    palette: { primary: '#bf202f', secondary: '#fdb719', tertiary: '#77787a' },
    contactInfo: { address: '175 Heim Rd, Williamsville, NY 14221', phone: '(716) 626-8600', email: 'heimmiddle@williamsvillek12.org', principal: 'Mr. Jeffrey Jachlewski' }
  },
  casey_middle: {
    id: 'casey_middle', name: 'Casey Middle School', logo: 'casey.png',
    palette: { primary: '#00463c', secondary: '#ffcb2c', tertiary: '#b27a3c' },
    contactInfo: { address: '105 Casey Rd, East Amherst, NY 14051', phone: '(716) 626-8600', email: 'caseyoffice@williamsvillek12.org', principal: 'Mr. Peter Dobmeier' }
  },
  country_parkway: {
    id: 'country_parkway', name: 'Country Parkway Elementary School', logo: 'country-parkway.png',
    palette: { primary: '#4d286a', secondary: '#f4eb2e', tertiary: '#231f20' },
    contactInfo: { address: '35 Hollybrook Dr, Williamsville, NY 14221', phone: '(716) 626-9860', email: 'cpoffice@williamsvillek12.org', principal: 'Mr. Andrew Bowen' }
  },
  dodge_elementary: {
    id: 'dodge_elementary', name: 'Dodge Elementary School', logo: 'dodge.png',
    palette: { primary: '#1e5732', secondary: '#fbd702', tertiary: '#000000' },
    contactInfo: { address: '1900 Dodge Rd, East Amherst, NY 14051', phone: '(716) 626-9820', email: 'dodgeoffice@williamsvillek12.org', principal: 'Mr. Charles Smilinich' }
  },
  forest_elementary: {
    id: 'forest_elementary', name: 'Forest Elementary School', logo: 'forest.png',
    palette: { primary: '#aa6e29', secondary: '#231f20', tertiary: '#ffffff' },
    contactInfo: { address: '250 N Forest Rd, Williamsville, NY 14221', phone: '(716) 626-9800', email: 'forestoffice@williamsvillek12.org', principal: 'Mrs. Keith' }
  },
  maple_east: {
    id: 'maple_east', name: 'Maple East Elementary School', logo: 'maple-east.png',
    palette: { primary: '#27398b', secondary: '#d6b683', tertiary: '#9ca1a3' },
    contactInfo: { address: '1500 Maple Rd, Williamsville, NY 14221', phone: '(716) 626-8800', email: 'mapleeast@williamsvillek12.org', principal: 'Mrs. Cathy Mihalic' }
  },
  maple_west: {
    id: 'maple_west', name: 'Maple West Elementary School', logo: 'maple-west.png',
    palette: { primary: '#00984c', secondary: '#f68620', tertiary: '#d26428' },
    contactInfo: { address: '851 Maple Rd, Williamsville, NY 14221', phone: '(716) 626-8840', email: 'maplewest@williamsvillek12.org', principal: 'Mr. Charles Galluzzo' }
  },
  heim_elementary: {
    id: 'heim_elementary', name: 'Heim Elementary School', logo: 'heim-elementary.png',
    palette: { primary: '#ac1f24', secondary: '#1e4480', tertiary: '#c4c6d8' },
    contactInfo: { address: '155 Heim Rd, Williamsville, NY 14221', phone: '(716) 626-8680', email: 'heimelem@williamsvillek12.org', principal: 'Ms. Bonnie Stafford' }
  },
};

const INITIAL_ITEMS = [
  { id: '1', name: 'Red Gym Bag', description: 'Left in the locker room near the showers.', category: 'Personal', schoolId: 'will_east', date: '2023-10-24', status: 'lost', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '2', name: 'Physics Textbook', description: 'Found in the science wing hallway.', category: 'Books', schoolId: 'will_north', date: '2023-10-25', status: 'found', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '3', name: 'Blue Hoodie', description: 'Size M. Left in Cafeteria.', category: 'Clothing', schoolId: 'will_south', date: '2023-10-26', status: 'lost', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: '4', name: 'Violin Case', description: 'Black hard case found in the music room.', category: 'Musical', schoolId: 'transit_middle', date: '2023-10-27', status: 'found', imageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&q=80&w=300&h=300' }
];

// --- AI Service ---

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGemini(params: { model?: string, contents: any, systemInstruction?: string }) {
  try {
    const response = await ai.models.generateContent({
      model: params.model || 'gemini-2.0-flash-exp',
      contents: params.contents,
      config: {
        systemInstruction: params.systemInstruction,
      }
    });
    return { text: response.text };
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
}

// --- Cinematic Login Components ---

const GlobeIcon: React.FC<{ phi: number, theta: number, Icon: any, delay: number }> = ({ phi, theta, Icon, delay }) => {
  const [visible, setVisible] = useState(false);
  const color = useMemo(() => {
    const colors = ['#60a5fa', '#f87171', '#fbbf24', '#34d399', '#a78bfa'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  
  useEffect(() => {
    const showHide = () => {
      const showDelay = Math.random() * 5000;
      const hideDelay = 2000 + Math.random() * 3000;
      
      setTimeout(() => {
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
          showHide();
        }, hideDelay);
      }, showDelay);
    };
    
    const initialTimer = setTimeout(showHide, delay * 1000);
    return () => clearTimeout(initialTimer);
  }, [delay]);

  const radius = 2.1;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return (
    <Html position={[x, y, z]} center distanceFactor={10}>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ color }}
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
          >
            <Icon size={28} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  );
};

const Globe = () => {
  const groupRef = useRef<THREE.Group>(null);
  const earthTexture = useMemo(() => new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'), []);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  const icons = useMemo(() => {
    const types = [Search, Smile, AlertCircle];
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      phi: Math.random() * Math.PI,
      theta: Math.random() * Math.PI * 2,
      Icon: types[i % types.length],
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          map={earthTexture}
          emissive="#112244"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.2}
        />
      </Sphere>
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial color="#4488ff" opacity={0.1} transparent side={THREE.BackSide} />
      </Sphere>
      {icons.map((icon) => (
        <GlobeIcon key={icon.id} {...icon} />
      ))}
    </group>
  );
};

const StarField = () => {
  const streaks = useMemo(() => Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    angle: Math.random() * Math.PI * 2,
    delay: Math.random() * 2,
    duration: 0.4 + Math.random() * 0.6,
    color: Math.random() > 0.8 ? '#60a5fa' : '#ffffff', 
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 2], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute w-32 h-32 bg-white rounded-full blur-3xl opacity-20"
      />
      {streaks.map((streak) => (
        <motion.div
          key={streak.id}
          initial={{ 
            rotate: `${streak.angle}rad`,
            width: 0,
            x: 0,
            y: 0,
            opacity: 0
          }}
          animate={{
            width: [0, 400, 800],
            x: [0, Math.cos(streak.angle) * 1000, Math.cos(streak.angle) * 2000],
            y: [0, Math.sin(streak.angle) * 1000, Math.sin(streak.angle) * 2000],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: streak.duration,
            repeat: Infinity,
            ease: "easeIn",
            delay: streak.delay,
          }}
          className="absolute h-[1px] origin-left"
          style={{ 
            backgroundColor: streak.color,
            boxShadow: `0 0 8px ${streak.color}`
          }}
        />
      ))}
    </div>
  );
};

const CinematicLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [state, setState] = useState<'login' | 'transitioning' | 'woosh'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setState('transitioning');
  };

  useEffect(() => {
    if (state === 'transitioning') {
      const timer = setTimeout(() => setState('woosh'), 2500); 
      return () => clearTimeout(timer);
    }
    if (state === 'woosh') {
      const timer = setTimeout(() => onLogin(), 3000); 
      return () => clearTimeout(timer);
    }
  }, [state, onLogin]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] font-sans text-white">
      <AnimatePresence mode="wait">
        {state === 'login' && (
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <div className="absolute inset-0 z-0">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                  <Globe />
                </Float>
              </Canvas>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md p-8 mx-4"
            >
              <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              </div>
              <div className="relative z-20 space-y-8">
                <div className="text-center space-y-2">
                  <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold tracking-tight"
                  >
                    Login
                  </motion.h1>
                  <p className="text-white/50 text-sm">Welcome back to the future</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white/60 transition-colors">
                      <input type="checkbox" className="rounded border-white/10 bg-white/5" />
                      Remember me
                    </label>
                    <a href="#" className="hover:text-white/60 transition-colors">Forgot password?</a>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    Log In
                    <LogIn size={18} />
                  </motion.button>
                </form>
                <div className="text-center text-sm text-white/30">
                  Don't have an account? <a href="#" className="text-white/60 hover:underline">Register</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {state === 'transitioning' && (
          <motion.div
            key="transition-screen"
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: '100vh', scale: 1 }}
              animate={{ 
                y: [null, 0, 0],
                scale: [1, 1, 20]
              }}
              transition={{ 
                duration: 2.5,
                times: [0, 0.4, 1],
                ease: ["easeOut", "easeInOut"]
              }}
              className="relative text-white flex items-center justify-center"
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-white/10 backdrop-blur-3xl rounded-full border-4 border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.3)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                />
                <Search size={300} strokeWidth={0.5} className="relative z-10" />
              </div>
            </motion.div>
          </motion.div>
        )}
        {state === 'woosh' && (
          <motion.div
            key="woosh-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60]"
          >
            <StarField />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, times: [0, 0.5, 1] }}
              className="absolute inset-0 bg-white/20 backdrop-blur-sm pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Lost & Found Components ---

const DoodleBackground = () => {
  return (
    <div className="doodle-bg fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-45 dark:opacity-60">
      <svg className="doodle-blob-1 absolute top-[5%] left-[2%] w-72 h-72 text-yellow-400/60 animate-float-slow" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.9C87.4,-34.7,90.1,-20.4,88.9,-6.3C87.7,7.9,82.6,21.8,74.5,33.8C66.5,45.8,55.5,55.9,43.3,63.2C31.1,70.5,17.7,75,4.1,75.7C-9.5,76.4,-23.1,73.4,-36.1,66.6C-49.1,59.8,-61.5,49.2,-70.3,36.5C-79.1,23.8,-84.3,9,-83.4,-5.4C-82.5,-19.8,-75.5,-33.8,-65.3,-44.6C-55.1,-55.4,-41.7,-63,-28.4,-70.7C-15.1,-78.4,-1.9,-86.2,12.3,-84.1C26.5,-82,40.7,-70,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>
      <svg className="doodle-blob-2 absolute bottom-[15%] right-[-5%] w-96 h-96 text-blue-400/40 animate-float-delayed" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M41.7,-67.6C54.1,-62.7,64.4,-53,72.3,-41.7C80.2,-30.4,85.7,-17.5,84.7,-5.2C83.7,7.1,76.2,18.8,68.4,30.3C60.6,41.8,52.5,53.1,41.9,61.9C31.3,70.7,18.2,77,4.5,77.8C-9.2,78.6,-27.4,73.9,-41.6,66.3C-55.8,58.7,-66,48.2,-72.7,35.9C-79.4,23.6,-82.6,9.5,-79.8,-3.4C-77,-16.3,-68.2,-28,-58.5,-37.6C-48.8,-47.2,-38.2,-54.7,-27.1,-60.8C-16,-66.9,-4.4,-71.6,7.5,-72.9C19.4,-74.2,31.3,-72.1,41.7,-67.6Z" transform="translate(100 100)" />
      </svg>
      <svg className="doodle-blob-3 absolute top-[40%] left-[-5%] w-64 h-64 text-purple-400/40 animate-wiggle" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M38.1,-53.4C49.8,-46.7,60,-36.8,66.4,-24.8C72.8,-12.8,75.4,1.3,71.8,13.9C68.2,26.5,58.4,37.6,47.5,46.1C36.6,54.6,24.6,60.5,12.3,62.5C0,64.5,-12.6,62.6,-24.1,57.1C-35.6,51.6,-45.9,42.5,-53.5,31.3C-61.1,20.1,-65.9,6.8,-64.3,-5.7C-62.7,-18.2,-54.7,-29.9,-44.6,-39.3C-34.5,-48.7,-22.3,-55.8,-9.6,-57.4C3.1,-59,15.8,-55.1,26.4,-60.1Z" transform="translate(100 100)" />
      </svg>
      <div className="doodle-heart absolute top-[18%] left-[18%] text-pink-500 animate-bounce-slow">
        <Heart size={40} fill="currentColor" className="opacity-65" />
      </div>
      <div className="doodle-sun absolute top-[28%] right-[25%] text-yellow-500 animate-spin-slow">
        <Sun size={56} className="opacity-65" />
      </div>
      <div className="doodle-music absolute bottom-[35%] left-[12%] text-indigo-500 animate-wiggle">
        <Music size={40} className="opacity-65" />
      </div>
      <div className="doodle-smile absolute bottom-[15%] right-[20%] text-emerald-500 animate-float">
        <Smile size={52} className="opacity-65" />
      </div>
      <div className="doodle-zap absolute top-[55%] left-[8%] text-purple-500 animate-pulse">
        <Zap size={32} fill="currentColor" className="opacity-65" />
      </div>
      <div className="doodle-cloud absolute top-[45%] right-[8%] text-sky-400 animate-float-slow">
        <Cloud size={64} fill="currentColor" className="opacity-65" />
      </div>
      <div className="doodle-star absolute bottom-[8%] left-[45%] text-orange-400 animate-bounce-slow" style={{ animationDelay: '1s' }}>
        <Star size={36} fill="currentColor" className="opacity-65" />
      </div>
      <div className="doodle-sparkles absolute top-[12%] right-[45%] text-teal-400 animate-wiggle" style={{ animationDelay: '2s' }}>
        <Sparkles size={44} className="opacity-65" />
      </div>
    </div>
  );
};

const Navbar = ({ onNavigate, currentView, isDarkMode, toggleTheme, isAdmin, setIsAdmin, selectedSchool }: { onNavigate: (v: string) => void, currentView: string, isDarkMode: boolean, toggleTheme: () => void, isAdmin: boolean, setIsAdmin: (v: boolean) => void, selectedSchool: any }) => {
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navBtnClass = (view: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${
      currentView === view
        ? 'bg-[#ab1e2f] text-white border-[#ab1e2f]'
        : 'text-[#e9ecef] bg-transparent border-transparent hover:text-white'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60]" style={{ height: 'calc(1.4 * 64px)' }}>
      <div className="flex justify-between items-center bg-[#142e53] w-full h-full p-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors duration-300">
        {/* Logo */}
        <div onClick={() => { onNavigate('HOME'); setIsMenuOpen(false); }} className="flex items-center gap-2 cursor-pointer px-4 py-2 hover:scale-105 transition-all">
          <div className="w-8 h-8 bg-[#ab1e2f] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">F</div>
          <span className="font-bold text-xl tracking-tight text-white">WCSDLost&Found</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          <button onClick={() => onNavigate('HOME')} className={navBtnClass('HOME')}><HomeIcon size={16} /><span className="text-sm font-bold">Home</span></button>
          <button onClick={() => onNavigate('SCHOOL_SELECT')} className={navBtnClass('SCHOOL_SELECT')}><Users size={16} /><span className="text-sm font-bold">Schools</span></button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <div className="relative">
            <button onMouseEnter={() => setShowInfoMenu(true)} className="flex items-center gap-2 px-4 py-2 rounded-full transition-all text-[#e9ecef] hover:text-white"><Info size={16} /><span className="text-sm font-bold">Resources</span></button>
            {showInfoMenu && (
              <div onMouseLeave={() => setShowInfoMenu(false)} className="absolute top-full right-0 mt-2 w-48 bg-[#142e53] border border-white/20 rounded-2xl p-2 shadow-xl animate-fade-in z-[70]">
                {[
                  { id: 'ABOUT', label: 'About Project', icon: <Info size={16} /> },
                  { id: 'RULES', label: 'Safety Rules', icon: <Scale size={16} /> },
                  { id: 'GUIDE', label: 'Help Guide', icon: <BookOpen size={16} /> }
                ].map(item => (
                  <button key={item.id} onClick={() => { onNavigate(item.id); setShowInfoMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#e9ecef] hover:text-white hover:bg-[#1f3a5a] text-sm font-bold">{item.icon} {item.label}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('CONTACTS')} className={navBtnClass('CONTACTS')}><Phone size={16} /><span className="text-sm font-bold">Contacts</span></button>
          <button onClick={() => onNavigate('MEET_MAKERS')} className={navBtnClass('MEET_MAKERS')}><span className="text-sm font-bold">Team</span></button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('LIVE_TRACKER')} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${currentView === 'LIVE_TRACKER' ? 'bg-[#ab1e2f] text-white border-[#ab1e2f]' : 'bg-transparent text-[#e9ecef] border-transparent hover:text-white'}`}><Camera size={18} /><span className="hidden md:inline font-bold text-sm">Tracker</span></button>
          
          {/* Settings Menu */}
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)} 
              className="p-2 rounded-full text-white hover:bg-[#1f3a5a] transition-all border border-transparent"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            {showSettingsMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#142e53] border border-white/20 rounded-2xl p-2 shadow-2xl animate-fade-in z-[70]">
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Preferences</p>
                </div>
                <button 
                  onClick={() => { toggleTheme(); setShowSettingsMenu(false); }} 
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[#e9ecef] hover:text-white hover:bg-[#1f3a5a] text-sm font-bold transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#ab1e2f]' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isDarkMode ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
                <div className="px-4 py-2 border-b border-white/10 my-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Account</p>
                </div>
                {isAdmin ? (
                  <button 
                    onClick={() => { setIsAdmin(false); setShowSettingsMenu(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-bold transition-colors"
                  >
                    <LogOut size={16} /> Logout Admin
                  </button>
                ) : (
                  <button 
                    onClick={() => { onNavigate('BULLETIN_BOARD'); setShowSettingsMenu(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#e9ecef] hover:text-white hover:bg-[#1f3a5a] text-sm font-bold transition-colors"
                  >
                    <Lock size={16} /> Staff Login
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-full text-white hover:bg-[#1f3a5a] transition-all">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 top-[calc(1.4*64px)] bg-[#142e53] z-[55] lg:hidden flex flex-col p-6 gap-4"
          >
            <button onClick={() => { onNavigate('HOME'); setIsMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white text-xl font-bold"><HomeIcon size={24} /> Home</button>
            <button onClick={() => { onNavigate('SCHOOL_SELECT'); setIsMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white text-xl font-bold"><Users size={24} /> Schools</button>
            <button onClick={() => { onNavigate('CONTACTS'); setIsMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 text-white text-xl font-bold"><Phone size={24} /> Contacts</button>
            <button onClick={() => { onNavigate('LIVE_TRACKER'); setIsMenuOpen(false); }} className="flex items-center gap-4 p-4 rounded-2xl bg-[#ab1e2f] text-white text-xl font-bold"><Camera size={24} /> AI Tracker</button>
            
            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
              <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 text-white font-bold">
                <div className="flex items-center gap-4">
                  {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const LiveTracker = ({ onItemFound, onCancel }: { onItemFound: (item: any) => void, onCancel: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) { videoRef.current.srcObject = mediaStream; }
    } catch (err) { setError("Unable to access camera. Please ensure permissions are granted."); }
  };

  const stopCamera = () => { if (stream) { stream.getTracks().forEach(track => track.stop()); } };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const imageData = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    analyzeImage(imageData);
    stopCamera();
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      const result = await callGemini({
        contents: [{ parts: [
          { text: "Analyze this image of a lost item. Provide a JSON response with 'name', 'category' (choose one: Clothing, Electronics, Books, Musical, Personal, Other), and a short 10-word 'description'. Return ONLY the JSON object, no markdown." },
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]}]
      });
      let responseText = result.text || "{}";
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const data = JSON.parse(responseText);
        setAnalysisResult(data);
      } catch (e) {
        setAnalysisResult({ name: "Identified Item", category: "Other", description: responseText.slice(0, 100) });
      }
    } catch (err) {
      console.error('analyzeImage error:', err);
      setAnalysisResult({ name: "Unknown Item", category: "Other", description: "An item captured on campus that needs manual review." });
    } finally { setIsAnalyzing(false); }
  };

  const finalizePost = () => {
    if (!analysisResult || !selectedSchool) return;
    onItemFound({
      id: Math.random().toString(36).substr(2, 9),
      name: analysisResult.name || 'Unknown Item',
      description: analysisResult.description || '',
      category: analysisResult.category || 'Other',
      schoolId: selectedSchool,
      date: new Date().toISOString().split('T')[0],
      status: 'found',
      imageUrl: capturedImage || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col font-sans overflow-hidden">
      <div className="relative z-10 flex justify-between items-center p-8 bg-white/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ab1e2f] rounded-full flex items-center justify-center text-white shadow-lg"><Sparkles size={24} /></div>
          <div><h3 className="text-white font-bold text-2xl tracking-tight">AI Vision Pro</h3><p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Real-time object detection</p></div>
        </div>
        <button onClick={onCancel} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all"><X size={24} /></button>
      </div>
      <div className="flex-1 relative z-10 p-6 flex items-center justify-center">
        {!capturedImage ? (
          <div className="w-full max-w-2xl aspect-[3/4] md:aspect-video bg-black rounded-[3rem] border-4 border-white/20 shadow-2xl overflow-hidden relative group">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
              <button onClick={capturePhoto} className="w-24 h-24 rounded-full bg-white p-2 shadow-2xl hover:scale-110 active:scale-90 transition-transform">
                <div className="w-full h-full rounded-full border-4 border-black flex items-center justify-center"><Camera className="text-black" size={32} /></div>
              </button>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all backdrop-blur-sm border border-white/30">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const imageData = ev.target.result as string;
                    setCapturedImage(imageData);
                    analyzeImage(imageData);
                    stopCamera();
                  };
                  reader.readAsDataURL(file);
                }} />
                Upload Photo
              </label>
            </div>
            {error && <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-8 text-center"><div className="space-y-4"><p className="text-red-400 font-bold">{error}</p><button onClick={startCamera} className="px-6 py-2 bg-white rounded-full text-black font-bold">Retry Access</button></div></div>}
          </div>
        ) : (
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center bg-[#f4f6f8] dark:bg-slate-800 p-8 rounded-[3rem]">
            <div className="relative">
              <div className="aspect-[3/4] bg-black rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-600 shadow-xl"><img src={capturedImage} className="w-full h-full object-cover" alt="Captured" /></div>
              <button onClick={() => { setCapturedImage(null); setAnalysisResult(null); startCamera(); }} className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-slate-700 text-black dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><X size={20} /></button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-lg relative overflow-hidden text-black dark:text-white">
              {isAnalyzing ? (
                <div className="py-20 flex flex-col items-center gap-6">
                  <Loader2 size={64} className="text-[#ab1e2f] animate-spin" />
                  <div className="text-center"><h4 className="text-2xl font-bold mb-2">Analyzing Object...</h4><p className="text-gray-500 dark:text-gray-400 font-medium">Querying neural network for identification</p></div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] font-bold uppercase tracking-widest mb-4">Scan Result Verified</span>
                    <h4 className="text-4xl font-black tracking-tight mb-2">{analysisResult?.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{analysisResult?.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Confidence</p><p className="text-xl font-bold">98.4%</p></div>
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700"><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Category</p><p className="text-xl font-bold">{analysisResult?.category}</p></div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                    <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">Select School Board</label>
                    <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors">
                      <option value="">-- Choose School --</option>
                      {Object.values(SCHOOL_THEMES).map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                    </select>
                  </div>
                  <button onClick={finalizePost} disabled={!selectedSchool} className={`w-full py-4 rounded-[25px] font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${selectedSchool ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'}`}>Post to Bulletin <ArrowRight size={20} /></button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const ContactsPage = () => {
  const [view, setView] = useState('ROOT');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  const CardButton = ({ icon: Icon, title, description, onClick, colorClass }: any) => (
    <button
      onClick={onClick}
      className="group w-full p-8 rounded-[24px] bg-white/90 dark:bg-[#666666]/90 backdrop-blur-sm shadow-xl text-left hover:scale-[1.02] transition-all duration-300 relative overflow-hidden z-10"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Icon size={120} />
      </div>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${colorClass} text-white shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{title}</h3>
      <p className="text-black dark:text-white font-medium text-lg">{description}</p>
      <div className="mt-8 flex items-center text-sm font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        View Contacts <ChevronRight size={16} className="ml-1" />
      </div>
    </button>
  );

  const ContactItem = ({ name, role, phone, email, icon: Icon }: any) => (
    <div className="bg-white/90 dark:bg-[#666666]/90 backdrop-blur-sm p-6 rounded-[20px] shadow-xl flex flex-col md:flex-row md:items-center gap-6 z-10 animate-fade-in-up">
      <div className="w-16 h-16 bg-slate-50 dark:bg-[#666666] rounded-full flex items-center justify-center text-black dark:text-white shadow-inner">
        <Icon size={32} />
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-bold text-black dark:text-white">{name}</h4>
        <p className="font-bold uppercase text-xs tracking-wider mb-3 text-black dark:text-white">{role}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm font-bold text-black dark:text-white hover:text-[#ab1e2f] dark:hover:text-[#ab1e2f] transition-colors bg-slate-100 dark:bg-[#666666] px-4 py-2 rounded-full"
            >
              <Phone size={14} /> {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-sm font-bold text-black dark:text-white hover:text-[#ab1e2f] dark:hover:text-[#ab1e2f] transition-colors bg-slate-100 dark:bg-[#666666] px-4 py-2 rounded-full"
            >
              <Mail size={14} /> {email}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] dark:bg-[#333333] neon-page-bg pt-28 pb-20 px-6 transition-colors duration-300 relative">
      <DoodleBackground />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-12">
          {view !== 'ROOT' && (
            <button
              onClick={() => {
                if (view === 'SCHOOL_DETAIL') setView('MAIN_OFFICE_SELECT');
                else if (view === 'SPORTS' || view === 'BUS' || view === 'MAIN_OFFICE_SELECT') setView('FACILITIES_MENU');
                else setView('ROOT');
              }}
              className="flex items-center gap-2 text-black dark:text-white hover:text-slate-900 dark:hover:text-white font-bold mb-6 transition-colors bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full w-fit backdrop-blur-sm"
            >
              <ArrowLeft size={20} /> Back
            </button>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-4 drop-shadow-sm">
            {view === 'ROOT' && 'Contact Directory'}
            {view === 'ADMIN' && 'Website Creators'}
            {view === 'FACILITIES_MENU' && 'Facilities & Services'}
            {view === 'SPORTS' && 'Athletics Department'}
            {view === 'BUS' && 'Transportation'}
            {view === 'MAIN_OFFICE_SELECT' && 'Select School Office'}
            {view === 'SCHOOL_DETAIL' && selectedSchool?.name}
          </h1>
          <p className="text-xl text-black dark:text-white max-w-2xl font-medium">
            {view === 'ROOT' && 'Who would you like to get in touch with today?'}
            {view === 'ADMIN' && 'Meet the student team behind the Lost & Found platform.'}
            {view === 'FACILITIES_MENU' && 'Select the specific department you need.'}
            {view === 'SPORTS' && 'Booking fields, sports schedules, and athletic inquiries.'}
            {view === 'BUS' && 'Bus schedules, lost items on buses, and route planning.'}
            {view === 'MAIN_OFFICE_SELECT' && 'Choose a school to view its specific main office contact details.'}
            {view === 'SCHOOL_DETAIL' && 'Direct contact information for the main office.'}
          </p>
        </div>

        {view === 'ROOT' && (
          <div className="grid md:grid-cols-2 gap-8">
            <CardButton
              title="Website Admins"
              description="Contact the student creators, maintainers, and platform support."
              icon={Code}
              colorClass="bg-blue-600"
              onClick={() => setView('ADMIN')}
            />
            <CardButton
              title="Facilities & Services"
              description="Athletics, transportation (buses), and individual school offices."
              icon={Briefcase}
              colorClass="bg-orange-500"
              onClick={() => setView('FACILITIES_MENU')}
            />
          </div>
        )}

        {view === 'ADMIN' && (
          <div className="grid gap-6">
            <div className="bg-blue-50/80 dark:bg-blue-900/20 p-8 rounded-[24px] shadow-xl mb-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Student Development Team</h3>
              <p className="text-black dark:text-white">Found a bug? Have a feature request? Reach out to our student engineering team directly.</p>
            </div>
            <ContactItem name="Haolin Jin" role="Full-stack Engineer" email="haolin.jin01@gmail.com" icon={Monitor} />
            <ContactItem name="Justin Yu" role="Front-end Engineer" email="iamlightrocks@gmail.com" icon={Code} />
            <ContactItem name="Abraham Joseph" role="Back-end Engineer" email="abejoseph26@gmail.com" icon={Cog} />
          </div>
        )}

        {view === 'FACILITIES_MENU' && (
          <div className="grid md:grid-cols-3 gap-6">
            <CardButton title="Athletics" description="Sports facilities & booking." icon={Trophy} colorClass="bg-emerald-500" onClick={() => setView('SPORTS')} />
            <CardButton title="Transportation" description="Buses & routing." icon={Bus} colorClass="bg-yellow-500" onClick={() => setView('BUS')} />
            <CardButton title="Main Offices" description="School specific contacts." icon={SchoolIcon} colorClass="bg-indigo-500" onClick={() => setView('MAIN_OFFICE_SELECT')} />
          </div>
        )}

        {view === 'SPORTS' && (
          <div className="grid gap-6">
            <div className="bg-emerald-50/80 dark:bg-emerald-900/20 p-8 rounded-[24px] shadow-xl mb-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Athletic Department</h3>
              <p className="text-black dark:text-white">For inquiries regarding gym usage, field booking, and sports schedules.</p>
            </div>
            <ContactItem name="Chris Mucica" role="District Athletic Director" phone="(716) 626-8030" email="cmucica@williamsvillek12.org" icon={Trophy} />
            <ContactItem name="Facilities Rental" role="Field & Gym Booking" phone="(716) 626-8009" email="facilities@williamsvillek12.org" icon={Building2} />
          </div>
        )}

        {view === 'BUS' && (
          <div className="grid gap-6">
            <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-8 rounded-[24px] shadow-xl mb-6 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Transportation Department</h3>
              <p className="text-black dark:text-white">Did you leave something on the bus? Contact us immediately with the bus number.</p>
            </div>
            <ContactItem name="Transportation Office" role="Main Dispatch" phone="(716) 626-8390" email="transportation@williamsvillek12.org" icon={Bus} />
            <ContactItem name="Lost & Found (Bus)" role="Item Recovery" phone="(716) 626-8399" email="buslostfound@williamsvillek12.org" icon={Briefcase} />
          </div>
        )}

        {view === 'MAIN_OFFICE_SELECT' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(SCHOOL_THEMES).map((school: any) => (
              <button
                key={school.id}
                onClick={() => {
                  setSelectedSchool(school);
                  setView('SCHOOL_DETAIL');
                }}
                className="flex items-center gap-4 p-4 bg-white/90 dark:bg-[#666666]/90 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm z-10"
                style={{ borderColor: 'transparent' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-[#666666]">
                  <img src={school.logo} alt={school.name} className="w-8 h-8 object-contain" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-black dark:text-white text-sm leading-tight">{school.name}</h4>
                  <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mt-1">Select</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'SCHOOL_DETAIL' && selectedSchool && (
          <div className="space-y-6">
            <div className="p-10 rounded-[24px] shadow-xl relative overflow-hidden z-10" style={{ backgroundColor: selectedSchool.palette.primary }}>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 bg-white rounded-full p-4 shadow-lg flex-shrink-0">
                  <img src={selectedSchool.logo} className="w-full h-full object-contain" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-black dark:text-white mb-2">{selectedSchool.name}</h2>
                  <p className="opacity-90 font-medium text-lg flex items-center justify-center md:justify-start gap-2 text-black dark:text-white">
                    <MapPin size={20} /> {selectedSchool.contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              <ContactItem name={selectedSchool.contactInfo.principal} role="Principal" phone={selectedSchool.contactInfo.phone} email={selectedSchool.contactInfo.email} icon={GraduationCap} />
              <ContactItem name="Attendance Office" role="Student Reporting" phone={selectedSchool.contactInfo.phone} email={selectedSchool.contactInfo.email} icon={SchoolIcon} />
              <ContactItem name="Health Office" role="School Nurse" phone={selectedSchool.contactInfo.phone} icon={Briefcase} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Home = ({ onNavigate, onStartClaim }: { onNavigate: (v: string) => void, onStartClaim: () => void }) => {
  return (
    <div className="bg-[#f4f6f8] dark:bg-[#666666] neon-page-bg min-h-screen font-sans pb-20 transition-colors duration-300 relative overflow-hidden">
      <DoodleBackground />
      <div className="text-center px-4 max-w-4xl mx-auto relative z-10 mt-20">
        <div className="mx-auto mt-5 mb-4 w-full sm:w-2/3 md:w-1/2 max-w-[1000px] p-2 bg-transparent rounded-lg animate-fade-in-up">
          <img src="WCSDlogo.png" alt="WCSD Logo" className="w-full h-auto mx-auto transform scale-105 md:scale-115"/>
        </div>
        <h1 className="text-black dark:text-white text-3xl font-bold my-4 leading-tight">
          Williamsville Central School District Lost &amp; Found
        </h1>
        <p className="text-black dark:text-white text-lg italic my-4 font-serif">
          "Nothing is ever really lost to us as long as we remember it" - L.M. Montgomery
        </p>
        <button onClick={() => onNavigate('SCHOOL_SELECT')} className="bg-[#ab1e2f] text-white border-2 border-[#ab1e2f] dark:border-[#ffffff] w-[200px] mt-8 py-3 rounded-[25px] text-lg cursor-pointer hover:scale-105 transition-transform duration-200 font-bold shadow-lg hover:shadow-xl">
          Select a School &rarr;
        </button>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={onStartClaim} className="flex items-center justify-center gap-2 bg-[#142e53] text-white border-2 border-[#142e53] dark:border-[#ffffff] py-3 px-6 rounded-[25px] text-sm font-bold hover:scale-105 transition-transform shadow-md">
            <FileText size={16} /> File a Claim
          </button>
          <button onClick={() => onNavigate('LIVE_TRACKER')} className="flex items-center justify-center gap-2 bg-[#142e53] text-white border-2 border-[#142e53] dark:border-[#ffffff] py-3 px-6 rounded-[25px] text-sm font-bold hover:scale-105 transition-transform shadow-md">
            <Camera size={16} /> Live Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

const SchoolSelect = ({ onSelect }: { onSelect: (s: any) => void }) => {
  const [filter, setFilter] = useState('');
  const filteredSchools = Object.values(SCHOOL_THEMES).filter(s => s.name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] dark:bg-[#333333] neon-page-bg py-8 px-4 transition-colors duration-300 relative">
      <DoodleBackground />
      <div className="max-w-[900px] mx-auto bg-white/90 dark:bg-[#666666]/90 backdrop-blur-md p-8 rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Select a School</h1>
          <div className="relative w-[80%] max-w-[500px] mx-auto">
            <input
              type="text"
              placeholder="Search for a school..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 pl-4 rounded-[12px] block text-black dark:text-white border border-black dark:border-white bg-white dark:bg-[#666666] outline-none focus:ring-2 focus:ring-black dark:focus:ring-white placeholder:text-black dark:placeholder:text-white transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-black dark:text-white" size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {filteredSchools.map((school) => (
            <button key={school.id} onClick={() => onSelect(school)} className="w-full neon-card bg-white dark:bg-[#666666] border-2 rounded-lg p-3 flex items-center transition-transform hover:scale-[1.02] active:scale-95 group shadow-sm hover:shadow-md" style={{ borderColor: school.palette.primary }}>
              <img src={school.logo} alt={school.name} className="w-8 h-8 object-contain mr-4" />
              <span className="text-black dark:text-white font-bold text-base text-left">{school.name}</span>
            </button>
          ))}
          {filteredSchools.length === 0 && <div className="text-center py-12 text-black dark:text-white">No schools found matching "{filter}"</div>}
        </div>
      </div>
    </div>
  );
};

const BulletinBoard = ({ school, items, setItems, goBack, initialTab, isAdmin, setIsAdmin }: { school: any, items: any[], setItems: any, goBack: () => void, initialTab?: string, isAdmin: boolean, setIsAdmin: (v: boolean) => void }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'BOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [claimingItem, setClaimingItem] = useState<any>(null);
  const [claimName, setClaimName] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  const [claimGrade, setClaimGrade] = useState('');
  const [emailNotification, setEmailNotification] = useState<any>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCat, setNewItemCat] = useState('Personal');
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isAdmin) setActiveTab('ADMIN');
  }, [isAdmin]);

  const schoolStyle: any = {
    '--school-primary': school.palette.primary,
    '--school-secondary': school.palette.secondary,
  };

  const filteredItems = items.filter(item => {
    const matchesSchool = item.schoolId === school.id;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const isPubliclyVisible = item.status === 'found' || item.status === 'pending_claim' || item.status === 'claimed';
    return matchesSchool && matchesSearch && matchesCategory && isPubliclyVisible;
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) { setIsAdmin(true); setShowAdminLogin(false); setPasswordInput(''); setLoginError(false); setActiveTab('ADMIN'); }
    else { setLoginError(true); }
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;
    setItems((prev: any[]) => prev.map(item => item.id === claimingItem.id ? { ...item, status: 'pending_claim', claimantName: claimName, claimantEmail: claimEmail } : item));
    setEmailNotification({ name: claimName, email: claimEmail });
    setClaimingItem(null); setClaimName(''); setClaimEmail(''); setClaimGrade('');
    setTimeout(() => setEmailNotification(null), 5000);
  };

  const handleDelete = (id: string) => { setItems((prev: any[]) => prev.filter(i => i.id !== id)); };
  const approveClaim = (id: string) => { setItems((prev: any[]) => prev.map(item => item.id === id ? { ...item, status: 'claimed' } : item)); };
  const approveLostItem = (id: string) => { setItems((prev: any[]) => prev.map(item => item.id === id ? { ...item, status: 'found' } : item)); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewItemImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemDesc) return alert("Fill all fields");
    const newItem = { id: Math.random().toString(36).substr(2, 9), name: newItemName, description: newItemDesc, category: newItemCat, schoolId: school.id, date: new Date().toISOString().split('T')[0], status: 'lost', imageUrl: newItemImage || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop' };
    setItems((prev: any[]) => [newItem, ...prev]);
    alert("Submitted for admin approval");
    setActiveTab('BOARD'); setNewItemName(''); setNewItemDesc(''); setNewItemImage(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] dark:bg-[#333333] neon-page-bg text-slate-900 dark:text-white pb-20 transition-colors duration-300" style={schoolStyle}>
      <header className="pt-32 pb-16 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden mb-12 text-white" style={{ backgroundColor: school.palette.primary }}>
        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12"><img src={school.logo} alt="Logo" className="w-64 h-64 object-contain" /></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <button onClick={goBack} className="flex items-center gap-2 font-bold mb-6 opacity-90 hover:opacity-100 transition-all text-sm uppercase tracking-widest text-white"><ArrowUp className="-rotate-90" size={18} /> Back to Schools</button>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none text-white drop-shadow-sm">{school.name}</h1>
          </div>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => isAdmin ? setActiveTab('ADMIN') : setShowAdminLogin(true)} className="flex items-center gap-2 px-6 py-3 rounded-[25px] font-bold text-sm uppercase tracking-wider transition-all shadow-lg border bg-white/20 backdrop-blur-xl border-white/30 hover:bg-white/30 text-white"><Lock size={18} /> {isAdmin ? 'Admin Panel' : 'Staff Login'}</button>
            <button onClick={() => setActiveTab('SUBMIT')} className="flex items-center gap-2 px-6 py-3 rounded-[25px] font-bold text-sm uppercase tracking-wider transition-all shadow-lg border hover:-translate-y-1 hover:shadow-xl active:translate-y-0 bg-white/20 backdrop-blur-xl border-white/30 hover:bg-white/30 text-white"><Camera size={18} /> Report Lost Item</button>
            {activeTab !== 'BOARD' && <button onClick={() => setActiveTab('BOARD')} className="flex items-center gap-2 px-6 py-3 bg-black/20 text-white border border-white/20 rounded-[25px] font-bold text-sm uppercase tracking-wider transition-all hover:bg-black/30">View Board</button>}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {activeTab === 'BOARD' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#666666] p-4 rounded-[25px] shadow-sm border border-slate-200 dark:border-[#1f2937]">
              <div className="relative flex-1 w-full md:w-auto"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 opacity-50" size={20} /><input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] py-3 pl-12 pr-6 rounded-[18px] outline-none transition-all font-medium text-slate-900 dark:text-white" /></div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {['All', ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className="px-5 py-2.5 rounded-[18px] font-bold whitespace-nowrap transition-all border text-slate-500 dark:text-slate-300 border-slate-200 dark:border-[#1f2937]"
                    style={selectedCategory === cat ? { backgroundColor: school.palette.primary, color: 'white', borderColor: school.palette.primary } : {}}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item.id} className="group neon-card bg-white dark:bg-[#666666] rounded-[18px] border border-slate-200 dark:border-[#1f2937] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
                  <div className="h-56 relative overflow-hidden bg-slate-100 dark:bg-[#666666]">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md ${item.status === 'lost' ? 'bg-red-500 text-white neon-badge-lost' : item.status === 'found' ? 'bg-green-500 text-white neon-badge-found' : 'bg-blue-500 text-white'}`}>{item.status.replace('_', ' ')}</span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white shadow-md" style={{ color: school.palette.primary }}>{item.category}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                      <div className="font-bold text-xs uppercase flex items-center gap-1" style={{ color: school.palette.primary, opacity: 0.6 }}><Calendar size={12} /> {item.date}</div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2 flex-1">{item.description}</p>
                    {item.status === 'found' && <button onClick={() => setClaimingItem(item)} className="w-full py-3 rounded-[12px] font-bold text-sm uppercase tracking-widest border-2 bg-white dark:bg-[#666666] transition-all" style={{ borderColor: school.palette.primary, color: school.palette.primary }}>Claim Item</button>}
                    {item.status === 'pending_claim' && <div className="w-full py-3 rounded-[12px] font-bold text-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-sm uppercase tracking-widest">Pending Approval</div>}
                    {item.status === 'claimed' && <div className="w-full py-3 rounded-[12px] font-bold text-center bg-slate-100 dark:bg-[#666666] text-slate-400 border border-slate-200 dark:border-[#1f2937] text-sm uppercase tracking-widest">Claimed</div>}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && <div className="col-span-full py-20 flex flex-col items-center text-center"><div className="w-24 h-24 bg-white dark:bg-[#666666] rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 dark:border-[#1f2937] shadow-sm"><Filter size={32} className="text-slate-300 dark:text-slate-600" /></div><h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No items found</h3><p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Try adjusting your filters to find what you're looking for.</p></div>}
            </div>
          </div>
        )}

        {activeTab === 'SUBMIT' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10"><h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Report a Lost Item</h2><p className="text-slate-500 dark:text-slate-400">Submit details to the admin for approval.</p></div>
            <form onSubmit={handleSubmitItem} className="bg-white dark:bg-[#666666] p-8 md:p-10 rounded-[25px] shadow-sm space-y-6" style={{ borderTop: `4px solid ${school.palette.primary}` }}>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">Item Name</label><input required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] p-4 rounded-[18px] outline-none transition-all font-medium text-slate-900 dark:text-white" placeholder="e.g. Red Hydroflask" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">Category</label><select value={newItemCat} onChange={(e) => setNewItemCat(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] p-4 rounded-[18px] outline-none transition-all font-medium appearance-none cursor-pointer text-slate-900 dark:text-white">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">Photo</label>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {newItemImage ? (
                      <div className="relative w-full h-[58px] rounded-[18px] overflow-hidden border border-slate-200 dark:border-[#1f2937]">
                        <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setNewItemImage(null); if (photoInputRef.current) photoInputRef.current.value = ''; }}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                        ><X size={12} /></button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] p-4 rounded-[18px] flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1f2937] hover:text-slate-600 dark:hover:text-slate-300 transition-all h-[58px] cursor-pointer"
                      >
                        <Camera size={20} /><span className="text-sm font-bold">Add Photo</span>
                      </button>
                    )}
                  </div>
                </div>
                <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">Description</label><textarea required rows={4} value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} className="w-full bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] p-4 rounded-[18px] outline-none transition-all font-medium resize-none text-slate-900 dark:text-white" placeholder="Where did you lose it? Any specific markings?" /></div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setActiveTab('BOARD')} className="flex-1 py-4 rounded-[18px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1f2937] transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] py-4 rounded-[18px] font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all" style={{ backgroundColor: school.palette.primary }}>Submit Report</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-white dark:bg-[#666666] p-6 rounded-[25px] shadow-sm" style={{ borderLeft: `8px solid ${school.palette.primary}` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-[#666666] rounded-full flex items-center justify-center" style={{ color: school.palette.primary }}><Shield size={24} /></div>
                <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2><p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Restricted Access</p></div>
              </div>
              <button onClick={() => { setIsAdmin(false); setActiveTab('BOARD'); }} className="px-6 py-2 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 rounded-full font-bold text-xs uppercase tracking-widest transition-colors">Logout</button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">Pending Lost Items</h3>
              <div className="grid gap-4">
                {items.filter(i => i.schoolId === school.id && i.status === 'lost').map(item => (
                  <div key={item.id} className="bg-white dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] p-6 rounded-[18px] shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-slate-100 dark:bg-[#666666] shrink-0"><img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 text-center md:text-left"><h4 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h4><p className="text-slate-500 dark:text-slate-400 text-sm">{item.description}</p><div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.date}</div></div>
                    <div className="flex gap-3">
                      <button onClick={() => approveLostItem(item.id)} className="px-6 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 rounded-full font-bold text-sm uppercase tracking-widest border border-green-100 dark:border-green-800 transition-colors">Approve</button>
                      <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 rounded-full border border-red-100 dark:border-red-800 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {items.filter(i => i.schoolId === school.id && i.status === 'lost').length === 0 && <div className="p-8 text-center text-slate-400">No pending lost items.</div>}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">Active Claims</h3>
              <div className="grid gap-4">
                {items.filter(i => i.schoolId === school.id && i.status === 'pending_claim').map(item => (
                  <div key={item.id} className="bg-white dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] p-6 rounded-[18px] shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-20 h-20 rounded-[12px] overflow-hidden bg-slate-100 dark:bg-[#666666] shrink-0"><img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl mt-2 flex items-center gap-3">
                        <Mail size={16} className="text-blue-500" />
                        <div><p className="text-sm font-bold text-slate-800 dark:text-white">{item.claimantName}</p><p className="text-xs text-slate-500">{item.claimantEmail}</p></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => approveClaim(item.id)} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full font-bold text-sm uppercase tracking-widest transition-colors"><Check size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 rounded-full border border-red-100 dark:border-red-800 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {items.filter(i => i.schoolId === school.id && i.status === 'pending_claim').length === 0 && <div className="p-8 text-center text-slate-400">No pending claims.</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#666666] rounded-[25px] p-8 w-full max-w-md shadow-2xl relative border border-white/20">
            <button onClick={() => setShowAdminLogin(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24} /></button>
            <div className="text-center mb-8"><div className="w-16 h-16 bg-slate-900 dark:bg-[#666666] text-white rounded-[18px] flex items-center justify-center mx-auto mb-4 shadow-lg"><Lock size={24} /></div><h3 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Access</h3></div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input autoFocus type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full p-4 bg-slate-50 dark:bg-[#666666] border dark:border-[#1f2937] rounded-[15px] outline-none transition-all font-bold text-center text-xl tracking-[0.5em] text-slate-900 dark:text-white ${loginError ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-slate-200'}`} placeholder="••••" />
                {loginError && <p className="text-red-500 text-center font-bold text-xs uppercase tracking-widest mt-2">Incorrect Access Code</p>}
              </div>
              <button type="submit" className="w-full text-white py-4 rounded-[18px] font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all" style={{ backgroundColor: school.palette.primary }}>Unlock Dashboard</button>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#666666] rounded-[25px] p-8 w-full max-w-lg shadow-2xl relative border border-white/20">
            <button onClick={() => setClaimingItem(null)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24} /></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4 shadow-lg text-white" style={{ backgroundColor: school.palette.primary }}><Tag size={24} /></div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Claim Item</h3>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">{claimingItem.name}</p>
            </div>
            <form onSubmit={handleClaim} className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">Full Name</label><input required value={claimName} onChange={(e) => setClaimName(e.target.value)} className="w-full p-4 bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] rounded-[15px] outline-none transition-all font-medium text-slate-900 dark:text-white" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">Grade / ID</label><input required value={claimGrade} onChange={(e) => setClaimGrade(e.target.value)} className="w-full p-4 bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] rounded-[15px] outline-none transition-all font-medium text-slate-900 dark:text-white" /></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-2">School Email</label><input required type="email" value={claimEmail} onChange={(e) => setClaimEmail(e.target.value)} className="w-full p-4 bg-[#f4f6f8] dark:bg-[#666666] border border-slate-200 dark:border-[#1f2937] rounded-[15px] outline-none transition-all font-medium text-slate-900 dark:text-white" /></div>
              <button type="submit" className="w-full text-white py-4 rounded-[18px] font-bold text-lg mt-4 shadow-lg hover:brightness-110 transition-all active:scale-95" style={{ backgroundColor: school.palette.primary }}>Submit Claim Request</button>
            </form>
          </div>
        </div>
      )}

      {/* Email Toast */}
      {emailNotification && (
        <div className="fixed top-24 right-6 z-[100] animate-fade-in-up">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-green-100 flex items-center gap-4 max-w-sm">
            <div className="bg-green-100 p-3 rounded-xl text-green-600"><Mail size={24} /></div>
            <div><h4 className="font-bold text-slate-800">Claim Submitted!</h4><p className="text-xs text-slate-500">Notification for <span className="font-medium text-slate-700">{emailNotification.email}</span></p></div>
            <button onClick={() => setEmailNotification(null)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const MeetMakers = () => {
  const team = [
    { name: "Haolin Jin", role: "Full-stack Engineer" },
    { name: "Justin Yu", role: "Front-end Engineer" },
    { name: "Abraham Joseph", role: "Back-end Engineer" }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] dark:bg-[#333333] neon-page-bg pt-24 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Meet the Developers</h1>
        <p className="text-xl text-black dark:text-white mb-12">The creative minds behind the Williamsville Central School District Lost & Found.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={member.name} className="bg-white/90 dark:bg-[#666666]/90 p-8 rounded-[18px] shadow-xl transition-transform hover:scale-[1.02]">
              <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-[#666666] rounded-full mb-6 overflow-hidden flex items-center justify-center border border-black dark:border-white">
                <img src={`https://picsum.photos/200/200?random=${index + 10}`} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-1">{member.name}</h3>
              <p className="text-white text-sm font-bold uppercase tracking-widest mb-4">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoPages = ({ type }: { type: string }) => {
  const content: Record<string, any> = {
    ABOUT: {
      title: "Why We Built This",
      subtitle: "Connecting lost items with their owners.",
      icon: <Heart size={64} className="text-red-600" />,
      sections: [
        {
          title: "Our Mission",
          text: "At Williamsville Central School District, we believe that student resources should be managed with efficiency and care. We built this platform to eliminate the frustration of losing personal items on campus.",
          icon: <Cloud className="text-black dark:text-white" />
        },
        {
          title: "Intelligent Recovery",
          text: "By utilizing computer vision and a unified district database, we've created a system that identifies and categorizes found items automatically, speeding up the recovery process.",
          icon: <Star className="text-black dark:text-white" />
        }
      ]
    },
    RULES: {
      title: "Safety First",
      subtitle: "Guidelines for claiming and reporting.",
      icon: <Shield size={64} className="text-blue-600" />,
      sections: [
        {
          title: "Proof of Ownership",
          text: "To claim an item, you may be asked to provide specific details not visible in the photo (e.g., lock code, internal content descriptions, or unique scratches).",
          icon: <CheckCircle className="text-black dark:text-white" />
        },
        {
          title: "Honesty Policy",
          text: "False claims are strictly prohibited. Attempting to claim items that do not belong to you will result in appropriate disciplinary action.",
          icon: <AlertTriangle className="text-black dark:text-white" />
        }
      ]
    },
    GUIDE: {
      title: "How It Works",
      subtitle: "A quick walkthrough of the platform.",
      icon: <BookOpen size={64} className="text-green-600" />,
      sections: [
        {
          title: "Browse or Scan",
          text: "Either navigate to your specific school board to see recent items, or use the 'Live Tracker' to point your camera at an item to see if it's already in our system.",
          icon: <HelpCircle className="text-black dark:text-white" />
        },
        {
          title: "Request a Claim",
          text: "When you find your item, click 'Claim'. Fill out your student information, and an administrator will verify your claim before sending a pickup notification.",
          icon: <Star className="text-black dark:text-white" />
        }
      ]
    }
  };

  const data = content[type];
  if (!data) return null;

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] dark:bg-[#333333] neon-page-bg pt-24 px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-transparent border border-black dark:border-white mb-8">
            {data.icon}
          </div>
          <h1 className="text-5xl font-bold text-black dark:text-white mb-4 tracking-tight">{data.title}</h1>
          <p className="text-2xl text-black dark:text-white font-light max-w-2xl mx-auto">{data.subtitle}</p>
        </div>
        <div className="bg-white dark:bg-[#666666] rounded-[18px] p-8 md:p-16 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <div className="grid md:grid-cols-2 gap-12">
            {data.sections.map((section: any, i: number) => (
              <div key={i}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-transparent border border-black dark:border-white">
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white">{section.title}</h3>
                </div>
                <p className="text-black dark:text-white text-lg leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HamsterBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', text: "Hii! I'm Hammy! 🐹 Did you lose something?" }]);
  const [input, setInput] = useState('');

  const send = async () => {
    const msg = input; setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    const res = await callGemini({
      contents: [{ role: 'user', parts: [{ text: msg }] }],
      systemInstruction: "You are Hammy, a cute hamster mascot. Help students find lost items."
    });
    setMessages(prev => [...prev, { role: 'model', text: res.text || "🐹?" }]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
          <div className="bg-[#ab1e2f] p-4 text-white font-bold">Hammy Bot 🐹</div>
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => <div key={i} className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[#ab1e2f] text-white ml-8' : 'bg-gray-100 dark:bg-slate-700 mr-8'}`}>{m.text}</div>)}
          </div>
          <div className="p-3 flex gap-2 border-t">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-2 rounded-xl border dark:bg-slate-900" placeholder="Ask Hammy..." />
            <button onClick={send} className="p-2 bg-[#ab1e2f] text-white rounded-xl"><Send size={18} /></button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-[#ab1e2f] rounded-full shadow-2xl flex items-center justify-center text-3xl">🐹</button>
    </div>
  );
};

// --- Main App Root ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('HOME');
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (!isLoggedIn) {
    return <CinematicLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#333333] transition-colors duration-300">
      <Navbar
        onNavigate={setCurrentView}
        currentView={currentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        selectedSchool={selectedSchool}
      />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'HOME' && <Home onNavigate={setCurrentView} onStartClaim={() => { setSelectedSchool(Object.values(SCHOOL_THEMES)[0]); setCurrentView('SUBMIT_CLAIM'); }} />}
            {currentView === 'SCHOOL_SELECT' && <SchoolSelect onSelect={(s) => { setSelectedSchool(s); setCurrentView('BULLETIN_BOARD'); }} />}
            {currentView === 'BULLETIN_BOARD' && selectedSchool && (
              <BulletinBoard
                school={selectedSchool}
                items={items}
                setItems={setItems}
                goBack={() => setCurrentView('SCHOOL_SELECT')}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
              />
            )}
            {currentView === 'SUBMIT_CLAIM' && selectedSchool && (
              <BulletinBoard
                school={selectedSchool}
                items={items}
                setItems={setItems}
                goBack={() => setCurrentView('HOME')}
                initialTab="SUBMIT"
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
              />
            )}
            {currentView === 'CONTACTS' && <ContactsPage />}
            {currentView === 'MEET_MAKERS' && <MeetMakers />}
            {['ABOUT', 'RULES', 'GUIDE'].includes(currentView) && <InfoPages type={currentView} />}
            {currentView === 'LIVE_TRACKER' && (
              <LiveTracker
                onItemFound={(item) => {
                  setItems(prev => [item, ...prev]);
                  setSelectedSchool(SCHOOL_THEMES[item.schoolId as keyof typeof SCHOOL_THEMES]);
                  setCurrentView('BULLETIN_BOARD');
                }}
                onCancel={() => setCurrentView('HOME')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <HamsterBot />
    </div>
  );
}
