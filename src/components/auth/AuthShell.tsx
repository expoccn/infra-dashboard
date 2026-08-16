import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#09090b] text-white">
      <div className="absolute inset-0 bg-[#09090b]" />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-full bg-cover bg-center opacity-95 md:w-[62%] lg:w-[58%]"
        style={{ backgroundImage: "url('/login-datacenter-bg.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,9,0.18)_0%,rgba(7,7,9,0.18)_36%,rgba(7,7,9,0.70)_58%,rgba(7,7,9,0.98)_78%,rgba(7,7,9,1)_100%)] md:bg-[linear-gradient(90deg,rgba(7,7,9,0.10)_0%,rgba(7,7,9,0.18)_38%,rgba(7,7,9,0.72)_57%,rgba(7,7,9,0.98)_76%,rgba(7,7,9,1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(227,6,19,0.22),transparent_23%),radial-gradient(circle_at_86%_9%,rgba(227,6,19,0.18),transparent_20%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.35))]"
      />

      <div className="absolute right-5 top-5 z-30 sm:right-7 sm:top-7">
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1480px] items-center gap-10 px-5 py-8 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] md:px-10 lg:gap-16 lg:px-14 xl:px-20">
        <section className="flex min-h-[320px] flex-col justify-center pt-8 md:min-h-0 md:justify-start md:pt-0">
          <img
            src="/claro-wordmark-red.png"
            alt="Claro"
            className="w-[250px] max-w-[66vw] object-contain sm:w-[310px] lg:w-[360px]"
          />

          <div className="mt-8 max-w-xl sm:mt-10">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.7rem]">
              Governança de Infraestrutura
            </h1>
            <p className="mt-1 text-2xl font-medium tracking-tight text-white/95 sm:text-3xl">DC-RJO-AM</p>
            <div className="mt-5 h-[2px] w-10 bg-[#e30613]" />
          </div>
        </section>

        <section className="flex items-center justify-center pb-20 pt-4 md:pb-8 md:pt-8">
          {children}
        </section>
      </div>

      <img
        src="/ccn-logo-white.png"
        alt="CCN Automação"
        className="absolute bottom-7 left-7 z-20 w-[118px] object-contain opacity-90 sm:bottom-8 sm:left-9 sm:w-[132px] lg:bottom-10 lg:left-12 lg:w-[145px]"
      />
    </div>
  );
}
