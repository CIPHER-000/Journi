import { JourniWordmark } from "./JourniWordmark";
import { JourniIcon } from "./JourniIcon";
import { JourniCombinationMark } from "./JourniCombinationMark";

export function LogoShowcase() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Journi Logo Package</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Professional logo designs for Journi, the AI-powered customer journey mapping platform. 
          Each variant is designed to work across different use cases and sizes.
        </p>
      </div>

      {/* Combination Mark */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Combination Mark</h2>
          <p className="text-sm text-muted-foreground">
            Primary logo for navigation, headers, and general brand usage
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Horizontal Layout */}
          <div className="space-y-4">
            <h3 className="font-medium">Horizontal Layout</h3>
            <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center">
                <JourniCombinationMark size="sm" layout="horizontal" />
              </div>
              <div className="flex items-center justify-center">
                <JourniCombinationMark size="md" layout="horizontal" />
              </div>
              <div className="flex items-center justify-center">
                <JourniCombinationMark size="lg" layout="horizontal" />
              </div>
            </div>
          </div>

          {/* Vertical Layout */}
          <div className="space-y-4">
            <h3 className="font-medium">Vertical Layout</h3>
            <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center">
                <JourniCombinationMark size="sm" layout="vertical" />
              </div>
              <div className="flex items-center justify-center">
                <JourniCombinationMark size="md" layout="vertical" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icon Only */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Icon Mark</h2>
          <p className="text-sm text-muted-foreground">
            Simplified mark for app icons, favicons, and small spaces
          </p>
        </div>
        
        <div className="p-6 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-4 gap-8 items-center justify-items-center">
            <JourniIcon size="sm" />
            <JourniIcon size="md" />
            <JourniIcon size="lg" />
            <JourniIcon size="xl" />
          </div>
        </div>
      </section>

      {/* Wordmark */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Wordmark</h2>
          <p className="text-sm text-muted-foreground">
            Text-based logo with stylized 'J' and flowing journey path
          </p>
        </div>
        
        <div className="p-6 bg-muted/30 rounded-lg">
          <div className="space-y-6 flex flex-col items-center">
            <JourniWordmark size="sm" />
            <JourniWordmark size="md" />
            <JourniWordmark size="lg" />
            <JourniWordmark size="xl" />
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Usage Guidelines</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-medium text-green-600">Combination Mark</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Primary logo for most uses</li>
              <li>• Navigation and headers</li>
              <li>• Marketing materials</li>
              <li>• Business cards and letterhead</li>
            </ul>
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-medium text-green-600">Icon Mark</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• App icons and favicons</li>
              <li>• Social media profile pictures</li>
              <li>• Small space applications</li>
              <li>• Loading spinners</li>
            </ul>
          </div>
          
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-medium text-green-600">Wordmark</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• When icon space is limited</li>
              <li>• Text-heavy layouts</li>
              <li>• Horizontal banner areas</li>
              <li>• Alternative branding option</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}