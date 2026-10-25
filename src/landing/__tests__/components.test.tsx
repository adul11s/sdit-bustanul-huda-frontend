import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSection } from '../components/HeroSection';
import { ProfileSection } from '../components/ProfileSection';
import { InquiryForm } from '../components/InquiryForm';
import { MemoryRouter } from 'react-router-dom';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('HeroSection', () => {
  it('renders school name and tagline', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('SDIT Bustanul Huda')).toBeInTheDocument();
    expect(screen.getByText('Sekolah Unggulan Berkarakter Islami')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Daftar Sekarang')).toBeInTheDocument();
    expect(screen.getByText('Hubungi Kami')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('15+')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('Tahun Berdiri')).toBeInTheDocument();
  });
});

describe('ProfileSection', () => {
  it('renders section title', () => {
    render(<ProfileSection />);
    
    expect(screen.getByText('Profil Sekolah')).toBeInTheDocument();
    expect(screen.getByText('Visi')).toBeInTheDocument();
    expect(screen.getByText('Misi')).toBeInTheDocument();
  });

  it('renders vision and mission content', () => {
    render(<ProfileSection />);
    
    expect(screen.getByText(/Menjadi sekolah Islam unggul/)).toBeInTheDocument();
    expect(screen.getByText(/Menyelenggarakan pendidikan Islam/)).toBeInTheDocument();
  });
});

describe('InquiryForm', () => {
  it('renders all form fields', () => {
    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText('Nama lengkap')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nama lengkap siswa')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0812-3456-7890')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@contoh.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tulis pesan atau pertanyaan Anda...')).toBeInTheDocument();
    expect(screen.getByText('Kirim Pendaftaran')).toBeInTheDocument();
  });

  it('shows grade options in select', () => {
    render(
      <MemoryRouter>
        <InquiryForm />
      </MemoryRouter>
    );
    
    const select = screen.getByDisplayValue('Pilih kelas');
    expect(select).toBeInTheDocument();
  });
});
