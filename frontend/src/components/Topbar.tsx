import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Modal } from './Modal';

interface CreateQueryForm {
  channel: 'email' | 'social' | 'chat';
  subject: string;
  message: string;
  customerName: string;
  customerEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const Topbar = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateQueryForm>({
    channel: 'email',
    subject: '',
    message: '',
    customerName: '',
    customerEmail: '',
    priority: 'medium',
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (payload: CreateQueryForm) => {
      await api.post('/queries', {
        channel: payload.channel,
        subject: payload.subject,
        message: payload.message,
        customerName: payload.customerName || undefined,
        customerEmail: payload.customerEmail || undefined,
        priority: payload.priority,
        tags: [],
      });
    },
    onSuccess: async () => {
      setOpen(false);
      setForm({
        channel: 'email',
        subject: '',
        message: '',
        customerName: '',
        customerEmail: '',
        priority: 'medium',
      });
      await queryClient.invalidateQueries({ queryKey: ['queries'] });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    createMutation.mutate(form);
  };

  return (
    <>
      <header className="flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-6 py-4 shadow-soft sticky top-0 z-40">
        <div className="animate-slide-down">
          <h2 className="text-xl font-bold text-slate-900">Inbox</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor, prioritize, and respond</p>
        </div>
        <div className="flex items-center gap-3 animate-slide-down" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <input 
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all" 
              placeholder="Search queries..." 
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-white text-sm font-medium shadow-medium hover:shadow-glow hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>+</span>
              <span>New Query</span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </header>

      <Modal open={open} title="New Query" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Channel</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as CreateQueryForm['channel'] }))}
              >
                <option value="email">Email</option>
                <option value="social">Social</option>
                <option value="chat">Chat</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as CreateQueryForm['priority'] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all resize-none"
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Customer Name</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Customer Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 transition-all"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-medium hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">
                {createMutation.isPending ? 'Creating…' : 'Create Query'}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
