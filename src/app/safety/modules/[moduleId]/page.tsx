
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { modulesData, type SafetyModule, type Topic, type SkillPhase, getTagClassName } from '@/data/safety-modules-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, AlertTriangle, CheckSquare, ListChecks } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function ModuleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<SafetyModule | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (moduleId) {
      const foundModule = modulesData.find(m => m.id === moduleId);
      if (foundModule) {
        setModule(foundModule);
        // Optionally, select the first topic by default
        // if (foundModule.topics.length > 0) {
        //   setSelectedTopic(foundModule.topics[0]);
        // }
      } else {
        // Handle module not found, e.g., redirect or show error
        router.push('/safety/modules');
      }
      setIsLoading(false);
    }
  }, [moduleId, router]);

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
        <CardTitle className="text-lg text-[hsl(var(--safety-blue-text-DEFAULT))]">{topic.title}</CardTitle>
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

  const SkillTimelinePhase: React.FC<{ phase: SkillPhase, isFirst: boolean, isLast: boolean }> = ({ phase, isFirst, isLast }) => (
    <div className="relative flex flex-col items-center">
      {/* Timeline Connector (not for first) */}
      {!isFirst && <div className="absolute top-2 left-[-50%] w-1/2 h-0.5 bg-[hsl(var(--safety-gray-border-DEFAULT))] z-0"></div>}
      
      {/* Marker */}
      <div className="relative z-10 w-4 h-4 bg-[hsl(var(--safety-blue-border-DEFAULT))] rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
      
      {/* Phase Card */}
      <Card className="mt-2 w-48 sm:w-56 bg-card p-3 shadow-sm border border-[hsl(var(--safety-gray-border-DEFAULT))]">
        <h4 className="font-semibold text-sm text-[hsl(var(--safety-blue-text-DEFAULT))]">{phase.title}</h4>
        <p className="text-xs text-muted-foreground mb-1">{phase.timeframe}</p>
        <p className="text-xs text-foreground">{phase.description}</p>
      </Card>
    </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column / Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Key Focus Areas */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Key Focus Areas</h2>
            <div className="space-y-4">
              {module.topics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedTopic?.id === topic.id}
                  onSelect={() => setSelectedTopic(topic)}
                />
              ))}
            </div>
          </section>

          {/* Suggested Skill Progression */}
          <section>
            <h2 className="text-xl font-semibold mb-6 text-foreground">Suggested Skill Progression</h2>
            <ScrollArea className="w-full pb-4">
              <div className="flex space-x-4 sm:space-x-0 sm:grid sm:grid-flow-col sm:auto-cols-max sm:gap-x-8 overflow-x-auto">
                {module.skillProgression.map((phase, index) => (
                  <SkillTimelinePhase 
                    key={phase.id} 
                    phase={phase}
                    isFirst={index === 0}
                    isLast={index === module.skillProgression.length - 1}
                  />
                ))}
              </div>
            </ScrollArea>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="md:col-span-1 md:sticky md:top-24 h-fit">
          <Card className="bg-white dark:bg-gray-800 shadow-lg border border-[hsl(var(--safety-gray-border-DEFAULT))]">
            <CardHeader>
              <CardTitle className="text-lg text-[hsl(var(--safety-blue-text-DEFAULT))]">
                {selectedTopic ? selectedTopic.title : "Select a Focus Area"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {selectedTopic ? (
                <>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center mb-1">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                      Safety Impact:
                    </h4>
                    <p className="text-muted-foreground">{selectedTopic.safetyImpact}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center mb-1">
                      <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                      Practical Relevance:
                    </h4>
                    <p className="text-muted-foreground">{selectedTopic.practicalRelevance}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center mb-1">
                       <ListChecks className="h-4 w-4 mr-2 text-sky-500" />
                      Key Points / Actions:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {selectedTopic.keyPoints.map((point, index) => (
                        <li key={index}>{point.text}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Click on a topic card from the "Key Focus Areas" to see more details here.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
