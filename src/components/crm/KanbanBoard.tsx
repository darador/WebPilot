'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreVertical,
  Plus,
  PhoneCall,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Business, CRMStage } from '@/types/database.types';
import { CRM_STAGES } from '@/lib/constants/crm';
import { formatShortDate } from '@/lib/utils';
import { updateBusinessStage } from '@/services/crm.service';
import { ActivityModal } from './ActivityModal';

interface KanbanBoardProps {
  pipeline: Record<CRMStage, Business[]>;
  isLoading: boolean;
  onRefresh: () => void;
}

export function KanbanBoard({ pipeline, isLoading, onRefresh }: KanbanBoardProps) {
  // Activity modal state
  const [activeActivityModal, setActiveActivityModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Moving card state
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleMoveStage = async (
    business: Business,
    targetStage: CRMStage
  ) => {
    if (business.status === targetStage) return;
    setMovingId(business.id);
    try {
      await updateBusinessStage(business.id, targetStage, business.status);
      onRefresh();
    } catch (err) {
      console.error('Error updating stage:', err);
    } finally {
      setMovingId(null);
    }
  };

  const getAdjacentStages = (currentStage: CRMStage) => {
    const currentIndex = CRM_STAGES.findIndex((s) => s.id === currentStage);
    const prev = currentIndex > 0 ? CRM_STAGES[currentIndex - 1] : null;
    const next = currentIndex < CRM_STAGES.length - 1 ? CRM_STAGES[currentIndex + 1] : null;
    return { prev, next };
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[calc(100vh-14rem)]">
        {CRM_STAGES.map((stage) => {
          const businesses = pipeline[stage.id] || [];

          return (
            <div
              key={stage.id}
              className="flex flex-col w-72 shrink-0 rounded-xl border border-[#1a2336] bg-[#090e1a]/80 backdrop-blur-sm max-h-[80vh]"
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between border-b px-3.5 py-3 rounded-t-xl ${stage.borderColor} ${stage.bgColor}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    {stage.label}
                  </h3>
                </div>

                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${stage.color}20`,
                    color: stage.color,
                  }}
                >
                  {businesses.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-lg bg-slate-800/30 animate-pulse border border-[#162035]"
                    />
                  ))
                ) : businesses.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-500">
                    Sin negocios en esta etapa
                  </div>
                ) : (
                  businesses.map((business) => {
                    const { prev, next } = getAdjacentStages(business.status);
                    const isMoving = movingId === business.id;

                    return (
                      <div
                        key={business.id}
                        className={`group rounded-lg border border-[#1b253b] bg-[#0d1424] p-3 text-xs transition-all hover:border-cyan-500/40 hover:bg-[#111a2e] hover:shadow-lg ${
                          isMoving ? 'opacity-40 pointer-events-none' : ''
                        }`}
                      >
                        {/* Title & Detail Link */}
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            href={`/prospects/${business.id}`}
                            className="font-semibold text-white group-hover:text-cyan-300 transition-colors hover:underline truncate"
                          >
                            {business.name}
                          </Link>
                          <Link
                            href={`/prospects/${business.id}`}
                            className="text-slate-500 hover:text-white p-0.5"
                            title="Ver ficha completa"
                          >
                            <Eye className="h-3 w-3" />
                          </Link>
                        </div>

                        {/* Industry & Location */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                          {business.industry && (
                            <span className="truncate max-w-[140px] text-cyan-400/90 font-medium">
                              {business.industry}
                            </span>
                          )}
                          {business.city && (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <MapPin className="h-2.5 w-2.5 text-slate-400" />
                              <span>{business.city}</span>
                            </span>
                          )}
                        </div>

                        {/* Website if available */}
                        {business.website && (
                          <div className="mt-1">
                            <a
                              href={
                                business.website.startsWith('http')
                                  ? business.website
                                  : `https://${business.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 font-mono truncate max-w-full"
                            >
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">
                                {business.website.replace(/^https?:\/\//, '')}
                              </span>
                            </a>
                          </div>
                        )}

                        {/* Card Footer: Quick Actions and Stage Shift */}
                        <div className="mt-3 flex items-center justify-between border-t border-[#172238] pt-2">
                          {/* Log Activity Button */}
                          <button
                            onClick={() =>
                              setActiveActivityModal({
                                id: business.id,
                                name: business.name,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded bg-[#162035] px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-cyan-950/60 hover:text-cyan-300 transition-colors"
                            title="Registrar llamada, email o nota"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>Actividad</span>
                          </button>

                          {/* Quick stage advance / rewind arrows */}
                          <div className="flex items-center gap-1">
                            {prev && (
                              <button
                                onClick={() => handleMoveStage(business, prev.id)}
                                className="p-1 rounded bg-[#141d30] text-slate-400 hover:bg-[#1a2640] hover:text-white transition-colors"
                                title={`Mover a ${prev.label}`}
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                            )}

                            {next && (
                              <button
                                onClick={() => handleMoveStage(business, next.id)}
                                className="p-1 rounded bg-[#141d30] text-cyan-400 hover:bg-[#1a2640] hover:text-cyan-300 transition-colors"
                                title={`Mover a ${next.label}`}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Modal */}
      {activeActivityModal && (
        <ActivityModal
          isOpen={Boolean(activeActivityModal)}
          businessId={activeActivityModal.id}
          businessName={activeActivityModal.name}
          onClose={() => setActiveActivityModal(null)}
          onSuccess={() => onRefresh()}
        />
      )}
    </>
  );
}
