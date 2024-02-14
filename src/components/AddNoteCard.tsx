import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface AddNoteCardProps {
  onNoteCreated: (content: string) => void;
}

export function AddNoteCard({ onNoteCreated }: AddNoteCardProps) {
  const [isRecording, setIsRecord] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState('');

  let speechRecognition: SpeechRecognition | null = null;

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (event.target.value === '') setShouldShowOnboarding(true);

    setContent(event.target.value);
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (!content && shouldShowOnboarding)
      return toast.error('Grave uma nota ou escreva alguma mensagem!');
    else if (!content && !shouldShowOnboarding)
      return toast.error('Escreva alguma mensagem!');

    onNoteCreated(content);
    toast.success('Nota criada com Sucesso');

    reset();
  }

  function reset() {
    setShouldShowOnboarding(true);
    setContent('');
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    if (!isSpeechRecognitionAPIAvailable)
      return toast.warning(
        'Infelizmente seu navegador não suporta a API de gravação!',
      );

    setIsRecord(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.lang = 'pt-BR';
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, '');

      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecord(false);

    speechRecognition?.stop();
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md bg-slate-700 p-5 gap-3 flex flex-col text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="z-10 fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-slate-700 md:max-w-[640px] md:h-[60vh] w-full md:rounded-md flex flex-col outline-none overflow-hidden">
          <Dialog.Close className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex flex-1  flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{' '}
                  <button
                    type="button"
                    className="text-lime-400 font-medium hover:underline"
                    onClick={handleStartRecording}
                  >
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    className="text-lime-400 font-medium hover:underline"
                    type="button"
                    onClick={handleStartEditor}
                  >
                    utilize apenas texto.
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChange}
                  value={content}
                ></textarea>
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                className="w-full bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-bold hover:text-slate-100 flex items-center justify-center gap-2"
                onClick={handleStopRecording}
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Gravando! (clique para interromper)
              </button>
            ) : (
              <button
                type="button"
                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-bold hover:bg-lime-500"
                onClick={handleSaveNote}
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
