import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Palette,
  Settings
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface BackgroundControlsProps {
  onBlurToggle: (enabled: boolean) => void;
  isBlurred: boolean;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({ 
  onBlurToggle, 
  isBlurred 
}) => {
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);

  const presetBackgrounds = [
    { id: 'blur', name: 'Blur', type: 'effect' },
    { id: 'office', name: 'Modern Office', type: 'image', preview: '/api/placeholder/150/100' },
    { id: 'library', name: 'Library', type: 'image', preview: '/api/placeholder/150/100' },
    { id: 'space', name: 'Space', type: 'image', preview: '/api/placeholder/150/100' },
    { id: 'abstract', name: 'Abstract', type: 'image', preview: '/api/placeholder/150/100' },
    { id: 'gradient', name: 'Purple Gradient', type: 'gradient' },
  ];

  const handleBackgroundSelect = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    
    if (backgroundId === 'blur') {
      onBlurToggle(true);
    } else {
      onBlurToggle(false);
      // Apply other background logic here
    }
  };

  const handleRemoveBackground = () => {
    setSelectedBackground(null);
    onBlurToggle(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={isBlurred || selectedBackground ? "default" : "secondary"}
          size="sm" 
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          <Camera className="w-4 h-4 mr-2" />
          Background
          {(isBlurred || selectedBackground) && (
            <Badge variant="secondary" className="ml-2 h-4 text-xs">
              ON
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Background Effects</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveBackground}
              disabled={!isBlurred && !selectedBackground}
            >
              Remove
            </Button>
          </div>

          {/* Quick Effects */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Quick Effects
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedBackground === 'blur' ? "default" : "outline"}
                size="sm"
                onClick={() => handleBackgroundSelect('blur')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <div className="w-6 h-6 rounded bg-gradient-to-r from-primary to-accent mb-1 blur-sm" />
                <span className="text-xs">Blur</span>
              </Button>
              
              <Button
                variant={selectedBackground === 'gradient' ? "default" : "outline"}
                size="sm"
                onClick={() => handleBackgroundSelect('gradient')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <div className="w-6 h-6 rounded bg-gradient-primary mb-1" />
                <span className="text-xs">Gradient</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-16 flex flex-col items-center justify-center"
              >
                <Upload className="w-4 h-4 mb-1" />
                <span className="text-xs">Custom</span>
              </Button>
            </div>
          </div>

          {/* Professional Backgrounds */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
              <Palette className="w-3 h-3 mr-1" />
              Professional
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {presetBackgrounds
                .filter(bg => bg.type === 'image')
                .map((background) => (
                <Button
                  key={background.id}
                  variant={selectedBackground === background.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBackgroundSelect(background.id)}
                  className="h-20 flex flex-col items-center justify-center p-2"
                >
                  <div className="w-full h-12 rounded bg-gradient-to-br from-muted to-muted-foreground/20 mb-1 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs">{background.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
          </div>

          {/* Current Status */}
          {(isBlurred || selectedBackground) && (
            <Card className="p-3 bg-success/10 border-success/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-success-foreground">
                  Background effect active
                </span>
              </div>
              {selectedBackground && (
                <div className="text-xs text-muted-foreground mt-1">
                  Using: {presetBackgrounds.find(bg => bg.id === selectedBackground)?.name || 'Custom'}
                </div>
              )}
            </Card>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};