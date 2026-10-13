import type {
  BrComConcordiaDomainCronogramaCronogramaDadosAtraso,
  BrComConcordiaDomainCronogramaCronogramaDadosCronograma,
  BrComConcordiaDomainCronogramaCronogramaDadosEtapa,
  BrComConcordiaDomainCronogramaCronogramaDadosSimulacao,
} from '@/api/generated/models';

export type Delay = BrComConcordiaDomainCronogramaCronogramaDadosAtraso;
export type Schedule = BrComConcordiaDomainCronogramaCronogramaDadosCronograma;
export type ScheduleStage = BrComConcordiaDomainCronogramaCronogramaDadosEtapa;
export type SchedulePreview = BrComConcordiaDomainCronogramaCronogramaDadosSimulacao;
