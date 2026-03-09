import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CheckIcon from '../../assets/icons/check-svgrepo-com.svg?react';
import styles from './styles.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      setSuccess(true);

    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1>Criar conta</h1>
          <p className={styles.registerSubtitle}>Preencha os dados para começar</p>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <CheckIcon className={styles.successIconSvg} aria-hidden="true" />
            </div>
            <h3>Conta criada com sucesso!</h3>
            <p>Você pode fazer login agora.</p>
            <Link to="/login" className={styles.btnPrimary}>
              Ir para Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Seu nome"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}

        {!success && (
          <div className={styles.registerFooter}>
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" className={styles.loginLink}>
                Faça login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
