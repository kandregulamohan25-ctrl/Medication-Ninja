import React, { useState } from 'react';
import useSound from 'use-sound';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Layout from './components/Layout';
import MedicineForm from './components/MedicineForm';
import RiskAssessment from './components/RiskAssessment';
import EducationSection from './components/EducationSection';
import InstallPrompt from './components/InstallPrompt';
import LoginScreen from './components/LoginScreen';
import Onboarding from './components/Onboarding';
import NinjaCompanion from './components/NinjaCompanion';
import Analytics from './components/Analytics';
import RiskGraph from './components/RiskGraph';
import BodyMap from './components/BodyMap';
import Remedies from './components/Remedies';
import Stories from './components/Stories';
import History from './components/History';
import LifetimeStats from './components/LifetimeStats';
import Experience from './components/Experience';
import { UserProvider, useUser } from './components/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import { calculateRisk } from './utils/riskLogic';
import { supabase } from './utils/supabaseClient';
import './App.css';

// Simple sound effect
const SOUND_POP = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const Dashboard = () => {
  const { user, login, completeOnboarding } = useUser();
  const [medicines, setMedicines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [playPop] = useSound(SOUND_POP);

  React.useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: medsData, error: medsError } = await supabase.from('medicines').select('*');
      if (medsError) throw medsError;
      
      const { data: histData, error: histError } = await supabase.from('history').select('*');
      if (histError) throw histError;

      const finalMeds = medsData || [];
      const finalHist = histData || [];

      console.log(`⚡ [Supabase] Fetched records: ${finalMeds.length} medicines, ${finalHist.length} history.`);

      setMedicines(finalMeds);
      setHistory(finalHist);
      localStorage.setItem('ninja_medicines', JSON.stringify(finalMeds));
      localStorage.setItem('ninja_history', JSON.stringify(finalHist));
    } catch (error) {
      console.error('❌ [Supabase] Fetch Error:', error?.message || error);
      const localMeds = JSON.parse(localStorage.getItem('ninja_medicines')) || [];
      const localHist = JSON.parse(localStorage.getItem('ninja_history')) || [];
      setMedicines(localMeds);
      setHistory(localHist);
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (medicine) => {
    const newMed = { ...medicine, id: Date.now() };
    
    // Optimistic UI & Local Storage
    const updatedMeds = [...(medicines || []), newMed];
    setMedicines(updatedMeds);
    localStorage.setItem('ninja_medicines', JSON.stringify(updatedMeds));
    playPop();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      const { data, error } = await supabase.from('medicines').insert([newMed]).select();
      if (error) throw error;
      
      console.log('⚡ [Supabase] Inserted medicine:', newMed.name);

      // Optional sync if Supabase modifies the ID
      if (data && data.length > 0 && data[0].id !== newMed.id) {
        const finalMeds = updatedMeds.map(m => m.id === newMed.id ? data[0] : m);
        setMedicines(finalMeds);
        localStorage.setItem('ninja_medicines', JSON.stringify(finalMeds));
      }
    } catch (error) {
      console.error('❌ [Supabase] Insert Error (using local fallback):', error?.message || error);
    }
  };

  const completeMedicine = async (id) => {
    const safeMedicines = medicines || [];
    const medToArchive = safeMedicines.find(m => m.id === id);
    
    if (medToArchive) {
      // Optimistic UI & Local Storage
      const updatedHistory = [medToArchive, ...(history || [])];
      const updatedMeds = safeMedicines.filter(m => m.id !== id);
      
      setHistory(updatedHistory);
      setMedicines(updatedMeds);
      localStorage.setItem('ninja_history', JSON.stringify(updatedHistory));
      localStorage.setItem('ninja_medicines', JSON.stringify(updatedMeds));
      playPop();

      try {
        const { error: insertError } = await supabase.from('history').insert([medToArchive]);
        if (insertError) throw insertError;
        
        const { error: deleteError } = await supabase.from('medicines').delete().eq('id', id);
        if (deleteError) throw deleteError;

        console.log('⚡ [Supabase] Completed & archived medicine:', medToArchive.name);
      } catch (error) {
        console.error('❌ [Supabase] Complete Error (using local fallback):', error?.message || error);
      }
    }
  };

  const restoreMedicine = async (med) => {
    // Optimistic UI & Local Storage
    const updatedMeds = [...(medicines || []), med];
    const updatedHistory = (history || []).filter(h => h.id !== med.id);
    
    setMedicines(updatedMeds);
    setHistory(updatedHistory);
    localStorage.setItem('ninja_medicines', JSON.stringify(updatedMeds));
    localStorage.setItem('ninja_history', JSON.stringify(updatedHistory));

    try {
      const { error: insertError } = await supabase.from('medicines').insert([med]);
      if (insertError) throw insertError;
      
      const { error: deleteError } = await supabase.from('history').delete().eq('id', med.id);
      if (deleteError) throw deleteError;

      console.log('⚡ [Supabase] Restored medicine:', med.name);
    } catch (error) {
      console.error('❌ [Supabase] Restore Error (using local fallback):', error?.message || error);
    }
  };

  const deleteHistory = async (id) => {
    // Optimistic UI & Local Storage
    const updatedHistory = (history || []).filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('ninja_history', JSON.stringify(updatedHistory));

    try {
      const { error } = await supabase.from('history').delete().eq('id', id);
      if (error) throw error;
      
      console.log('⚡ [Supabase] Deleted history record ID:', id);
    } catch (error) {
      console.error('❌ [Supabase] Delete Error (using local fallback):', error?.message || error);
    }
  };

  const getRiskLevel = () => {
    if (!medicines) return 'Low';
    const result = calculateRisk(medicines, history, user?.baseRiskScore || 0);
    return result.level;
  };

  // If no user, show the Login Screen
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  // Show onboarding if not completed
  if (!user.onboardingCompleted) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <Layout>
      <motion.div
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section className="hero-section" variants={itemVariants}>
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome, {user?.name || 'Ninja'}!
          </motion.h2>
          <p>Master your health. Defeat the resistance.</p>
        </motion.section>

        <div className="app-grid">
          <div className="left-column">
            <motion.div variants={itemVariants}>
              <MedicineForm onAdd={addMedicine} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="dashboard-grid">
                <Analytics medicines={medicines} history={history} />
                <RiskGraph medicines={medicines} />
                <BodyMap medicines={medicines} />
                <LifetimeStats history={history} />
              </div>
            </motion.div>
          </div>

          <motion.div className="medicines-list card" variants={itemVariants}>
            <h3>Your Inventory 🎒</h3>
            {medicines.length === 0 ? (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '2px dashed var(--secondary-color)' }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🥷✨</div>
                <h4 style={{ marginBottom: '0.5rem', fontFamily: 'var(--heading-font)' }}>You are on standby, Ninja!</h4>
                <p style={{ color: 'var(--light-text)', marginBottom: '1.5rem' }}>No medicines yet. Start your first mission.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  + Add Medicine
                </button>
              </motion.div>
            ) : (
              <motion.ul layout>
                <AnimatePresence>
                  {medicines.map(med => (
                    <motion.li
                      key={med.id}
                      className="medicine-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                    >
                      <div>
                        <strong>{med.name}</strong>
                        <span className="med-details">{med.dosage} • {med.frequency} • {med.duration} days</span>
                      </div>
                      <div className="med-actions">
                        <button
                          className="btn-complete"
                          onClick={() => completeMedicine(med.id)}
                          title="Complete & Archive"
                        >
                          ✅
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}

            {medicines.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <RiskAssessment medicines={medicines} history={history} baseRiskScore={user?.baseRiskScore || 0} />
              </motion.div>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <History
                history={history}
                onRestore={restoreMedicine}
                onDeleteForever={deleteHistory}
              />
            )}
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Remedies medicines={medicines} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stories />
        </motion.div>

        <motion.div variants={itemVariants}>
          <EducationSection />
        </motion.div>

        <InstallPrompt />
        <NinjaCompanion riskLevel={getRiskLevel()} />
      </motion.div>
    </Layout>
  );
};

const LoadingScreen = () => (
  <motion.div
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--primary-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      color: 'white'
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.img 
      src={`${import.meta.env.BASE_URL}ninja-happy.png`} 
      alt="Ninja Logo" 
      style={{ width: '150px', marginBottom: '1rem' }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
    />
    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      style={{ fontFamily: 'var(--heading-font)', margin: 0 }}
    >
      Medication Ninja
    </motion.h1>
  </motion.div>
);

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [showExperience, setShowExperience] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isAppLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      {!isAppLoading && (
        showExperience ? (
          <Experience onEnter={() => setShowExperience(false)} />
        ) : (
          <ErrorBoundary>
            <UserProvider>
              <Dashboard />
            </UserProvider>
          </ErrorBoundary>
        )
      )}
    </>
  );
}

export default App;
