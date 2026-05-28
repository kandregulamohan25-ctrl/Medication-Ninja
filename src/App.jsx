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

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const staggerItem = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const Dashboard = () => {
  const { user, login, completeOnboarding } = useUser();
  const [medicines, setMedicines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

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
    const updatedMeds = [...(medicines || []), newMed];
    setMedicines(updatedMeds);
    localStorage.setItem('ninja_medicines', JSON.stringify(updatedMeds));
    playPop();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    try {
      const { data, error } = await supabase.from('medicines').insert([newMed]).select();
      if (error) throw error;
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
      } catch (error) {
        console.error('❌ [Supabase] Complete Error (using local fallback):', error?.message || error);
      }
    }
  };

  const restoreMedicine = async (med) => {
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
    } catch (error) {
      console.error('❌ [Supabase] Restore Error (using local fallback):', error?.message || error);
    }
  };

  const deleteHistory = async (id) => {
    const updatedHistory = (history || []).filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('ninja_history', JSON.stringify(updatedHistory));

    try {
      const { error } = await supabase.from('history').delete().eq('id', id);
      if (error) throw error;
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
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <div className="container">
        <AnimatePresence mode="wait">
          {/* ===== HOME PAGE ===== */}
          {currentPage === 'home' && (
            <motion.div key="home" {...pageTransition}>
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                <motion.section className="hero-section" variants={staggerItem}>
                  <h1 className="hero-title">
                    Welcome, {user?.name || 'Ninja'}!
                  </h1>
                  <p className="hero-subtitle">Master your health. Defeat the resistance.</p>
                </motion.section>

                {medicines.length > 0 && (
                  <motion.div variants={staggerItem} className="quick-risk-badge">
                    <RiskAssessment medicines={medicines} history={history} baseRiskScore={user?.baseRiskScore || 0} />
                  </motion.div>
                )}

                <motion.div variants={staggerItem}>
                  <MedicineForm onAdd={addMedicine} />
                </motion.div>

                <motion.div className="medicines-list card" variants={staggerItem}>
                  <h2 className="section-heading">Your Inventory 🎒</h2>
                  {medicines.length === 0 ? (
                    <motion.div
                      className="empty-state"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="empty-icon">🥷✨</div>
                      <h3>You are on standby, Ninja!</h3>
                      <p>No medicines yet. Start your first mission.</p>
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
                                aria-label={`Complete ${med.name}`}
                              >
                                ✅
                              </button>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* ===== INSIGHTS PAGE ===== */}
          {currentPage === 'insights' && (
            <motion.div key="insights" {...pageTransition}>
              <section className="page-header">
                <h1 className="page-title">📊 Health Insights</h1>
                <p className="page-subtitle">Your antibiotic resistance risk and body impact analysis</p>
              </section>

              <div className="insights-grid">
                <Analytics medicines={medicines} history={history} />
                <RiskGraph medicines={medicines} />
                <BodyMap medicines={medicines} />
                <LifetimeStats history={history} />
              </div>

              {history.length > 0 && (
                <History
                  history={history}
                  onRestore={restoreMedicine}
                  onDeleteForever={deleteHistory}
                />
              )}
            </motion.div>
          )}

          {/* ===== LEARN PAGE ===== */}
          {currentPage === 'learn' && (
            <motion.div key="learn" {...pageTransition}>
              <section className="page-header">
                <h1 className="page-title">📚 Knowledge Dojo</h1>
                <p className="page-subtitle">Learn about antibiotic resistance and how to protect yourself</p>
              </section>

              <Remedies medicines={medicines} />
              <Stories />
              <EducationSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InstallPrompt />
      <NinjaCompanion riskLevel={getRiskLevel()} />

      {/* ===== BOTTOM TAB BAR ===== */}
      <nav className="bottom-tab-bar" aria-label="Main navigation" role="navigation">
        <button
          className={`tab-btn ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Home"
          aria-current={currentPage === 'home' ? 'page' : undefined}
        >
          <span className="tab-icon" aria-hidden="true">🏠</span>
          <span className="tab-label">Home</span>
        </button>
        <button
          className={`tab-btn ${currentPage === 'insights' ? 'active' : ''}`}
          onClick={() => { setCurrentPage('insights'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Health Insights"
          aria-current={currentPage === 'insights' ? 'page' : undefined}
        >
          <span className="tab-icon" aria-hidden="true">📊</span>
          <span className="tab-label">Insights</span>
        </button>
        <button
          className={`tab-btn ${currentPage === 'learn' ? 'active' : ''}`}
          onClick={() => { setCurrentPage('learn'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="Learn about AMR"
          aria-current={currentPage === 'learn' ? 'page' : undefined}
        >
          <span className="tab-icon" aria-hidden="true">📚</span>
          <span className="tab-label">Learn</span>
        </button>
      </nav>
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
      alt="Medication Ninja Logo" 
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
