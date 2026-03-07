import { Moon, Sun, Languages, User, LogOut, Cloud, Droplets, Compass, ShoppingCart, Lightbulb, Users } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from './ThemeProvider';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
  onSwitchProfile?: () => void;
}

export function Header({ activeSection, onNavigate, onSwitchProfile }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Compass },
    { id: 'weather', label: t('weather'), icon: Cloud },
    { id: 'rainfall', label: t('rainfall'), icon: Droplets },
    { id: 'decisions', label: t('decisions'), icon: Lightbulb },
    { id: 'marketplace', label: t('marketplace'), icon: ShoppingCart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('appName')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Languages className="h-5 w-5" />
                  <span className="sr-only">{t('language')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('bn')} className="text-base">
                  {language === 'bn' && '✓ '}বাংলা
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="text-base">
                  {language === 'en' && '✓ '}English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">{t('theme')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')} className="text-base">
                  {theme === 'light' && '✓ '}{t('lightMode')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="text-base">
                  {theme === 'dark' && '✓ '}{t('darkMode')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="text-base">
                  {theme === 'system' && '✓ '}System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.user_metadata?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onSwitchProfile && (
                    <DropdownMenuItem onClick={onSwitchProfile} className="text-base">
                      <Users className="mr-2 h-4 w-4" />
                      {t('switchProfile')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()} className="text-base text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {onNavigate && (
          <div className="flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className="flex-shrink-0"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
