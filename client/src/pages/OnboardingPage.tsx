import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, Pen, Sparkles } from 'lucide-react';
import api from '../lib/api';

const steps = [
  { title: 'Welcome to Narratica!', subtitle: "Let's personalize your experience" },
  { title: 'What do you want to write?', subtitle: 'You can always change this later' },
  { title: "You're all set!", subtitle: 'Time to bring your story to life' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState('novel');
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const handleComplete = async () => {
    await api.put('/users/profile', { onboardingComplete: true });
    updateUser({ onboardingComplete: true });
    navigate('/new-project');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-12">
        {steps.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i <= step ? 'bg-primary-600' : 'bg-ink-300'}`} />
        ))}
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-ink-900 mb-2">{steps[step].title}</h1>
        <p className="text-ink-500 text-lg">{steps[step].subtitle}</p>
      </div>

      {step === 0 && (
        <div className="card p-8 text-center">
          <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <p className="text-ink-600 mb-6 max-w-md mx-auto">
            Narratica is your AI writing partner. We'll guide you from your initial idea all the way to a finished manuscript — one step at a time.
          </p>
          <button onClick={() => setStep(1)} className="btn-primary text-lg px-8">Let's Get Started</button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {[
            { value: 'novel', icon: BookOpen, label: 'Novel', desc: 'A full-length fiction or non-fiction book' },
            { value: 'short_story', icon: Pen, label: 'Short Story', desc: 'A shorter work of fiction (under 20,000 words)' },
            { value: 'screenplay', icon: Sparkles, label: 'Screenplay', desc: 'A script for film or television' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              className={`card p-6 w-full text-left flex items-center gap-4 transition-all ${format === opt.value ? 'ring-2 ring-primary-500 border-primary-500' : 'hover:border-ink-300'}`}
            >
              <opt.icon className={`w-8 h-8 ${format === opt.value ? 'text-primary-600' : 'text-ink-400'}`} />
              <div>
                <h3 className="font-semibold text-ink-900">{opt.label}</h3>
                <p className="text-sm text-ink-500">{opt.desc}</p>
              </div>
            </button>
          ))}
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(0)} className="btn-ghost">Back</button>
            <button onClick={() => setStep(2)} className="btn-primary">Continue</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-8 text-center">
          <Sparkles className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <p className="text-ink-600 mb-6 max-w-md mx-auto">
            Great choice! Let's create your first project. Our AI writing partner will help you develop your idea, build your characters, and outline your story.
          </p>
          <button onClick={handleComplete} className="btn-primary text-lg px-8">Create My First Project</button>
        </div>
      )}
    </div>
  );
}
