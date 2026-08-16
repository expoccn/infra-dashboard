import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#070708] text-white" style={{ colorScheme: 'dark' }}>
      {/*
       * Login institucional: o tema desta tela é propositalmente fixo.
       * O seletor claro/escuro permanece disponível apenas dentro do dashboard.
       */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-datacenter-bg-wide.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,3,5,0.06)_0%,rgba(3,3,5,0.08)_34%,rgba(3,3,5,0.28)_55%,rgba(3,3,5,0.52)_72%,rgba(3,3,5,0.68)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(227,6,19,0.11),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(227,6,19,0.10),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.20))]"
      />

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1580px] gap-8 px-6 py-8 sm:px-9 md:grid-cols-[minmax(0,1fr)_minmax(430px,540px)] md:items-center md:gap-14 md:px-12 lg:gap-20 lg:px-16 xl:px-20 2xl:px-24">
        <section className="flex min-h-[300px] flex-col justify-center pt-6 md:min-h-0 md:justify-center md:pb-20 md:pt-0">
          <img
            src="/claro-wordmark-red.png"
            alt="Claro"
            className="w-[255px] max-w-[70vw] object-contain sm:w-[300px] lg:w-[340px] xl:w-[365px]"
          />

          <div className="mt-7 max-w-xl sm:mt-9">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-[2.6rem]">
              Governança de Infraestrutura
            </h1>
            <p className="mt-1 text-2xl font-medium tracking-tight text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] sm:text-3xl">
              DC-RJO-AM
            </p>
            <div className="mt-5 h-[2px] w-10 bg-[#e30613] shadow-[0_0_16px_rgba(227,6,19,0.55)]" />
          </div>
        </section>

        <section className="flex items-center justify-center pb-24 pt-2 md:justify-end md:pb-8 md:pt-8">
          {children}
        </section>

        <div className="flex items-center pb-2 md:hidden">
          <img
            src="/ccn-logo-white.png"
            alt="CCN Automação"
            className="w-[118px] object-contain opacity-90"
          />
        </div>
      </div>

      <img
        src="/ccn-logo-white.png"
        alt="CCN Automação"
        className="absolute bottom-9 left-9 z-20 hidden w-[128px] object-contain opacity-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:block lg:bottom-11 lg:left-14 lg:w-[140px] xl:left-16 xl:w-[148px]"
      />
    </div>
  );
}
