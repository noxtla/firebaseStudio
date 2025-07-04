
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { modulesData, type SafetyModule, type Topic, type SkillPhase, getTagClassName } from '@/data/safety-modules-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitleComponent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ChevronLeft, AlertTriangle, CheckSquare, ListChecks, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SkillTimelinePhaseProps {
  phase: SkillPhase;
  isFirst: boolean;
  isLast: boolean;
  animationDelay: string;
}

const SkillTimelinePhase: React.FC<SkillTimelinePhaseProps> = ({ phase, isFirst, isLast, animationDelay }) => (
  <div
    className={cn(
      "relative flex flex-col items-center animate-step-enter"
    )}
    style={{ animationDelay }}
  >
    {!isFirst && <div className="absolute top-2 left-[-50%] w-1/2 h-0.5 bg-[hsl(var(--safety-gray-border-DEFAULT))] z-0"></div>}
    <div className="relative z-10 w-4 h-4 bg-[hsl(var(--safety-blue-border-DEFAULT))] rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
    <Card className="mt-2 w-52 bg-card p-3 shadow-sm border border-[hsl(var(--safety-gray-border-DEFAULT))] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
      <h4 className="font-semibold text-sm text-[hsl(var(--safety-blue-text-DEFAULT))]">{phase.title}</h4>
      <p className="text-xs text-muted-foreground mb-1">{phase.timeframe}</p>
      <p className="text-xs text-foreground">{phase.description}</p>
    </Card>
  </div>
);


export default function ModuleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<SafetyModule | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (moduleId) {
      const foundModule = modulesData.find(m => m.id === moduleId);
      if (foundModule) {
        setModule(foundModule);
      } else {
        router.push('/safety/modules');
      }
      setIsLoading(false);
    }
  }, [moduleId, router]);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDetailDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><p>Loading module details...</p></div>;
  }

  if (!module) {
    return <div className="flex justify-center items-center min-h-[60vh]"><p>Module not found.</p></div>;
  }

  const TopicCard: React.FC<{ topic: Topic; isSelected: boolean; onSelect: () => void }> = ({ topic, isSelected, onSelect }) => (
    <Card
      className={cn(
        "safety-topic-card cursor-pointer hover:shadow-md",
        isSelected && "safety-topic-card-selected shadow-lg"
      )}
      onClick={onSelect}
    >
      <CardHeader className="p-0 mb-2">
        <CardTitleComponent className="text-lg text-[hsl(var(--safety-blue-text-DEFAULT))]">{topic.title}</CardTitleComponent>
      </CardHeader>
      <CardContent className="p-0 space-y-2">
        <p className="text-sm text-muted-foreground">{topic.description}</p>
        <span className={cn(
            "inline-block px-2 py-0.5 rounded-full text-xs font-semibold",
            getTagClassName(topic.tag)
          )}>
            {topic.tag}
          </span>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/safety/modules" passHref legacyBehavior>
          <Button variant="ghost" className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-sm px-3 py-1 h-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-center text-[hsl(var(--safety-blue-text-DEFAULT))] font-heading-style flex-grow truncate px-4">
          {module.title}
        </h1>
      </div>

      <div className="space-y-12">
        {/* Key Focus Areas */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Key Focus Areas</h2>
          <div className="space-y-4">
            {module.topics.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isSelected={selectedTopic?.id === topic.id}
                onSelect={() => handleTopicSelect(topic)}
              />
            ))}
          </div>
        </section>

        {/* Suggested Skill Progression */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-foreground">Suggested Skill Progression</h2>
          <ScrollArea className="w-full rounded-md"> {/* Added rounded-md for consistency if scrollbar appears */}
            <div className="flex space-x-6 py-3 px-2"> {/* Adjusted class for flex layout, spacing, and padding */}
              {module.skillProgression.map((phase, index) => (
                <SkillTimelinePhase
                  key={phase.id}
                  phase={phase}
                  isFirst={index === 0}
                  isLast={index === module.skillProgression.length - 1}
                  animationDelay={`${index * 100}ms`}
                />
              ))}
            </div>
          </ScrollArea>
        </section>
      </div>

      {selectedTopic && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader className="pt-2 pr-12">
              <DialogTitle className="text-xl md:text-2xl text-[hsl(var(--safety-blue-text-DEFAULT))]">
                {selectedTopic.title}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Keep ScrollArea for dialog content */}
              <div className="space-y-4 py-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center mb-1">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                    Safety Impact:
                  </h4>
                  <p className="text-muted-foreground ml-6">{selectedTopic.safetyImpact}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center mb-1">
                    <CheckSquare className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                    Practical Relevance:
                  </h4>
                  <p className="text-muted-foreground ml-6">{selectedTopic.practicalRelevance}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center mb-1">
                     <ListChecks className="h-4 w-4 mr-2 text-sky-500 flex-shrink-0" />
                    Key Points / Actions:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-7">
                    {selectedTopic.keyPoints.map((point, index) => (
                      <li key={index}>{point.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="flex justify-center sm:justify-center pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="bg-success text-success-foreground hover:bg-success/90"
                  size="lg"
                >
                  OK
                </Button>
              </DialogClose>
            </DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="absolute right-4 top-4 p-1 h-auto">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
