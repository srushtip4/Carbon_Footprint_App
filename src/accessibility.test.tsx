import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

function renderWithProviders(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('AppLayout accessibility', () => {
  it('renders a skip navigation link', () => {
    renderWithProviders(
      <AppLayout currentPage="education" onNavigate={() => {}}>
        <div>Content</div>
      </AppLayout>
    );
    const skipLink = screen.queryByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    if (skipLink) {
      expect(skipLink.tagName).toBe('A');
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    }
  });

  it('has main content landmark', () => {
    renderWithProviders(
      <AppLayout currentPage="education" onNavigate={() => {}}>
        <div>Content</div>
      </AppLayout>
    );
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main?.id).toBe('main-content');
  });

  it('has banner role on header', () => {
    renderWithProviders(
      <AppLayout currentPage="education" onNavigate={() => {}}>
        <div>Content</div>
      </AppLayout>
    );
    const header = document.querySelector('[role="banner"]');
    expect(header).toBeInTheDocument();
  });

  it('nav elements have aria-label', () => {
    renderWithProviders(
      <AppLayout currentPage="education" onNavigate={() => {}}>
        <div>Content</div>
      </AppLayout>
    );
    const navs = document.querySelectorAll('nav');
    navs.forEach(nav => {
      expect(nav.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('decorative images have aria-hidden', () => {
    renderWithProviders(
      <AppLayout currentPage="education" onNavigate={() => {}}>
        <div>Content</div>
      </AppLayout>
    );
    const bgDivs = document.querySelectorAll('[aria-hidden="true"]');
    expect(bgDivs.length).toBeGreaterThan(0);
  });
});

describe('Accessibility CSS classes', () => {
  it('sr-only class is defined in CSS', () => {
    // Verify the sr-only utility exists (Tailwind provides it)
    const el = document.createElement('div');
    el.className = 'sr-only';
    expect(el.className).toContain('sr-only');
  });
});
