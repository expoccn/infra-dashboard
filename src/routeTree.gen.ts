/* eslint-disable */

// @ts-nocheck

// Generated for the validated Claro RJO-AM frontend routes.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as EnergiaPueRouteImport } from './routes/energia-pue'
import { Route as DisponibilidadeRouteImport } from './routes/disponibilidade'
import { Route as ManutencaoRouteImport } from './routes/manutencao'
import { Route as CapacidadeRouteImport } from './routes/capacidade'
import { Route as ClimatizacaoRouteImport } from './routes/climatizacao'
import { Route as DieselRouteImport } from './routes/diesel'
import { Route as RacksRouteImport } from './routes/racks'
import { Route as PlanoAcaoRouteImport } from './routes/plano-acao'
import { Route as QualidadeDadosRouteImport } from './routes/qualidade-dados'
import { Route as RelatoriosRouteImport } from './routes/relatorios'
import { Route as AnalisesIaRouteImport } from './routes/analises-ia'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

const EnergiaPueRoute = EnergiaPueRouteImport.update({
  id: '/energia-pue',
  path: '/energia-pue',
  getParentRoute: () => rootRouteImport,
} as any)

const DisponibilidadeRoute = DisponibilidadeRouteImport.update({
  id: '/disponibilidade',
  path: '/disponibilidade',
  getParentRoute: () => rootRouteImport,
} as any)

const ManutencaoRoute = ManutencaoRouteImport.update({
  id: '/manutencao',
  path: '/manutencao',
  getParentRoute: () => rootRouteImport,
} as any)

const CapacidadeRoute = CapacidadeRouteImport.update({
  id: '/capacidade',
  path: '/capacidade',
  getParentRoute: () => rootRouteImport,
} as any)

const ClimatizacaoRoute = ClimatizacaoRouteImport.update({
  id: '/climatizacao',
  path: '/climatizacao',
  getParentRoute: () => rootRouteImport,
} as any)

const DieselRoute = DieselRouteImport.update({
  id: '/diesel',
  path: '/diesel',
  getParentRoute: () => rootRouteImport,
} as any)

const RacksRoute = RacksRouteImport.update({
  id: '/racks',
  path: '/racks',
  getParentRoute: () => rootRouteImport,
} as any)

const PlanoAcaoRoute = PlanoAcaoRouteImport.update({
  id: '/plano-acao',
  path: '/plano-acao',
  getParentRoute: () => rootRouteImport,
} as any)

const QualidadeDadosRoute = QualidadeDadosRouteImport.update({
  id: '/qualidade-dados',
  path: '/qualidade-dados',
  getParentRoute: () => rootRouteImport,
} as any)

const RelatoriosRoute = RelatoriosRouteImport.update({
  id: '/relatorios',
  path: '/relatorios',
  getParentRoute: () => rootRouteImport,
} as any)

const AnalisesIaRoute = AnalisesIaRouteImport.update({
  id: '/analises-ia',
  path: '/analises-ia',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/energia-pue': typeof EnergiaPueRoute
  '/disponibilidade': typeof DisponibilidadeRoute
  '/manutencao': typeof ManutencaoRoute
  '/capacidade': typeof CapacidadeRoute
  '/climatizacao': typeof ClimatizacaoRoute
  '/diesel': typeof DieselRoute
  '/racks': typeof RacksRoute
  '/plano-acao': typeof PlanoAcaoRoute
  '/qualidade-dados': typeof QualidadeDadosRoute
  '/relatorios': typeof RelatoriosRoute
  '/analises-ia': typeof AnalisesIaRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/energia-pue': typeof EnergiaPueRoute
  '/disponibilidade': typeof DisponibilidadeRoute
  '/manutencao': typeof ManutencaoRoute
  '/capacidade': typeof CapacidadeRoute
  '/climatizacao': typeof ClimatizacaoRoute
  '/diesel': typeof DieselRoute
  '/racks': typeof RacksRoute
  '/plano-acao': typeof PlanoAcaoRoute
  '/qualidade-dados': typeof QualidadeDadosRoute
  '/relatorios': typeof RelatoriosRoute
  '/analises-ia': typeof AnalisesIaRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/energia-pue': typeof EnergiaPueRoute
  '/disponibilidade': typeof DisponibilidadeRoute
  '/manutencao': typeof ManutencaoRoute
  '/capacidade': typeof CapacidadeRoute
  '/climatizacao': typeof ClimatizacaoRoute
  '/diesel': typeof DieselRoute
  '/racks': typeof RacksRoute
  '/plano-acao': typeof PlanoAcaoRoute
  '/qualidade-dados': typeof QualidadeDadosRoute
  '/relatorios': typeof RelatoriosRoute
  '/analises-ia': typeof AnalisesIaRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/energia-pue' | '/disponibilidade' | '/manutencao' | '/capacidade' | '/climatizacao' | '/diesel' | '/racks' | '/plano-acao' | '/qualidade-dados' | '/relatorios' | '/analises-ia'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/energia-pue' | '/disponibilidade' | '/manutencao' | '/capacidade' | '/climatizacao' | '/diesel' | '/racks' | '/plano-acao' | '/qualidade-dados' | '/relatorios' | '/analises-ia'
  id: '__root__' | '/' | '/energia-pue' | '/disponibilidade' | '/manutencao' | '/capacidade' | '/climatizacao' | '/diesel' | '/racks' | '/plano-acao' | '/qualidade-dados' | '/relatorios' | '/analises-ia'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  EnergiaPueRoute: typeof EnergiaPueRoute
  DisponibilidadeRoute: typeof DisponibilidadeRoute
  ManutencaoRoute: typeof ManutencaoRoute
  CapacidadeRoute: typeof CapacidadeRoute
  ClimatizacaoRoute: typeof ClimatizacaoRoute
  DieselRoute: typeof DieselRoute
  RacksRoute: typeof RacksRoute
  PlanoAcaoRoute: typeof PlanoAcaoRoute
  QualidadeDadosRoute: typeof QualidadeDadosRoute
  RelatoriosRoute: typeof RelatoriosRoute
  AnalisesIaRoute: typeof AnalisesIaRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/energia-pue': {
      id: '/energia-pue'
      path: '/energia-pue'
      fullPath: '/energia-pue'
      preLoaderRoute: typeof EnergiaPueRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/disponibilidade': {
      id: '/disponibilidade'
      path: '/disponibilidade'
      fullPath: '/disponibilidade'
      preLoaderRoute: typeof DisponibilidadeRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/manutencao': {
      id: '/manutencao'
      path: '/manutencao'
      fullPath: '/manutencao'
      preLoaderRoute: typeof ManutencaoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/capacidade': {
      id: '/capacidade'
      path: '/capacidade'
      fullPath: '/capacidade'
      preLoaderRoute: typeof CapacidadeRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/climatizacao': {
      id: '/climatizacao'
      path: '/climatizacao'
      fullPath: '/climatizacao'
      preLoaderRoute: typeof ClimatizacaoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/diesel': {
      id: '/diesel'
      path: '/diesel'
      fullPath: '/diesel'
      preLoaderRoute: typeof DieselRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/racks': {
      id: '/racks'
      path: '/racks'
      fullPath: '/racks'
      preLoaderRoute: typeof RacksRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/plano-acao': {
      id: '/plano-acao'
      path: '/plano-acao'
      fullPath: '/plano-acao'
      preLoaderRoute: typeof PlanoAcaoRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/qualidade-dados': {
      id: '/qualidade-dados'
      path: '/qualidade-dados'
      fullPath: '/qualidade-dados'
      preLoaderRoute: typeof QualidadeDadosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/relatorios': {
      id: '/relatorios'
      path: '/relatorios'
      fullPath: '/relatorios'
      preLoaderRoute: typeof RelatoriosRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/analises-ia': {
      id: '/analises-ia'
      path: '/analises-ia'
      fullPath: '/analises-ia'
      preLoaderRoute: typeof AnalisesIaRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  EnergiaPueRoute: EnergiaPueRoute,
  DisponibilidadeRoute: DisponibilidadeRoute,
  ManutencaoRoute: ManutencaoRoute,
  CapacidadeRoute: CapacidadeRoute,
  ClimatizacaoRoute: ClimatizacaoRoute,
  DieselRoute: DieselRoute,
  RacksRoute: RacksRoute,
  PlanoAcaoRoute: PlanoAcaoRoute,
  QualidadeDadosRoute: QualidadeDadosRoute,
  RelatoriosRoute: RelatoriosRoute,
  AnalisesIaRoute: AnalisesIaRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
