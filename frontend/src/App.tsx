import { useState, useEffect } from 'react';
import { Trash2, Plus, Check, ListTodo, Loader2 } from 'lucide-react';

interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Todo listesini cekme
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Veriler alınamadı.');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Backend servisine bağlanılamadı. Servisin çalıştığından ve veritabanı bağlantısının açık olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Todo ekleme
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, isCompleted: false }),
      });

      if (!res.ok) throw new Error('Görev eklenirken bir hata oluştu.');
      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
      alert('Görev eklenemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  // Todo durumunu guncelleme (Complete/Incomplete)
  const handleToggleTodo = async (todo: Todo) => {
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
    try {
      // Optimizasyon için önce yerel durumu güncelle
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? updatedTodo : t))
      );

      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });

      if (!res.ok) throw new Error('Güncelleme başarısız.');
    } catch (err) {
      console.error(err);
      // Hata durumunda eski haline geri al
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? todo : t))
      );
      alert('Durum güncellenemedi.');
    }
  };

  // Todo silme
  const handleDeleteTodo = async (id: number) => {
    try {
      // Optimizasyon için önce yerel durumu güncelle
      setTodos((prev) => prev.filter((t) => t.id !== id));

      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Silme işlemi başarısız.');
    } catch (err) {
      console.error(err);
      fetchTodos(); // Hata durumunda listeyi tekrar yenile
      alert('Görev silinemedi.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '12px', marginBottom: '1rem', color: '#6366f1' }}>
            <ListTodo size={32} />
          </div>
          <h1>Docker & EF Core Sandbox</h1>
          <p style={{ color: '#94a3b8', margin: '0', fontSize: '0.95rem' }}>
            .NET 10 Web API, React & PostgreSQL CRUD Deneyimi
          </p>
        </header>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
            {error}
            <button onClick={fetchTodos} style={{ display: 'block', background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ffffff', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: '600' }}>
              Yeniden Dene
            </button>
          </div>
        )}

        <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Yeni bir görev ekleyin..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={submitting}
          />
          <button type="submit" className="btn-primary" disabled={submitting || !newTitle.trim()}>
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Ekle
          </button>
        </form>

        <main>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', color: '#6366f1' }}>
              <Loader2 className="animate-spin" size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : todos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              <p style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>Yapılacak görev bulunmuyor.</p>
              <p style={{ fontSize: '0.85rem', margin: '0' }}>Yukarıdaki alandan ilk görevinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="animate-fade-in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'rgba(30, 41, 59, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    onClick={() => handleToggleTodo(todo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: todo.isCompleted ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.2)',
                        background: todo.isCompleted ? '#6366f1' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: 'white',
                      }}
                    >
                      {todo.isCompleted && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span
                      style={{
                        textDecoration: todo.isCompleted ? 'line-through' : 'none',
                        color: todo.isCompleted ? '#64748b' : '#f1f5f9',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        userSelect: 'none',
                      }}
                    >
                      {todo.title}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="btn-danger"
                    aria-label="Görevi Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}
