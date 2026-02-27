import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { useGetGoogleSheetsURL, useSetGoogleSheetsURL, useRefreshGoogleSheet } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

export default function AdminPanel() {
  const { data: currentUrl, isLoading: isUrlLoading } = useGetGoogleSheetsURL();
  const setUrlMutation = useSetGoogleSheetsURL();
  const refreshMutation = useRefreshGoogleSheet();

  const [urlInput, setUrlInput] = useState('');
  const [urlFeedback, setUrlFeedback] = useState<FeedbackState>(null);
  const [refreshFeedback, setRefreshFeedback] = useState<FeedbackState>(null);
  const [refreshedRowCount, setRefreshedRowCount] = useState<number | null>(null);

  useEffect(() => {
    if (currentUrl) {
      setUrlInput(currentUrl);
    }
  }, [currentUrl]);

  const handleSaveUrl = async () => {
    if (!urlInput.trim()) {
      setUrlFeedback({ type: 'error', message: 'Please enter a valid URL.' });
      return;
    }
    setUrlFeedback(null);
    try {
      await setUrlMutation.mutateAsync(urlInput.trim());
      setUrlFeedback({ type: 'success', message: 'Google Sheets URL saved successfully.' });
    } catch (err) {
      setUrlFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save URL.',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshFeedback(null);
    setRefreshedRowCount(null);
    try {
      const csv = await refreshMutation.mutateAsync();
      const lines = csv ? csv.split('\n').filter(l => l.trim()).length : 0;
      const dataRows = Math.max(0, lines - 1);
      setRefreshedRowCount(dataRows);
      setRefreshFeedback({
        type: 'success',
        message: `Data refreshed successfully. ${dataRows} data row${dataRows !== 1 ? 's' : ''} loaded.`,
      });
    } catch (err) {
      setRefreshFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to refresh data.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-xs sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-primary shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-foreground leading-tight font-display truncate">
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Configure your Google Sheets data source
              </p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Back</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6">

        {/* Info banner */}
        <div className="rounded-lg border border-border bg-accent/40 px-3 sm:px-4 py-3 flex items-start gap-2 sm:gap-3">
          <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-foreground min-w-0">
            <p className="font-medium mb-0.5 text-xs sm:text-sm">How to get your CSV export URL</p>
            <p className="text-muted-foreground text-xs leading-relaxed break-words">
              In Google Sheets, go to <strong>File → Share → Publish to web</strong>, select your sheet, choose <strong>CSV</strong> format, and click <strong>Publish</strong>. Copy the generated link and paste it below.
            </p>
            <a
              href="https://support.google.com/docs/answer/183965"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-xs mt-1.5 font-medium"
            >
              Learn more <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* URL Configuration Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm sm:text-base font-semibold font-display">Sheet URL</CardTitle>
              {currentUrl && !isUrlLoading && (
                <Badge variant="secondary" className="text-xs shrink-0">Configured</Badge>
              )}
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Enter the public CSV export URL from your Google Sheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="sheet-url" className="text-xs sm:text-sm font-medium">
                Google Sheets CSV Export URL
              </Label>
              {/* Stack input and button on mobile */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="sheet-url"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlFeedback(null);
                  }}
                  disabled={isUrlLoading || setUrlMutation.isPending}
                  className="w-full font-mono text-xs min-h-[2.5rem]"
                />
                <Button
                  onClick={handleSaveUrl}
                  disabled={isUrlLoading || setUrlMutation.isPending || !urlInput.trim()}
                  className="gap-2 shrink-0 w-full sm:w-auto min-h-[2.5rem]"
                >
                  {setUrlMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>

            {urlFeedback && (
              <Alert
                variant={urlFeedback.type === 'error' ? 'destructive' : 'default'}
                className="py-2 sm:py-3"
              >
                {urlFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription className="text-xs sm:text-sm break-words">
                  {urlFeedback.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Refresh Card */}
        <Card className="shadow-card">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold font-display">Refresh Data</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manually trigger a fresh fetch from the configured Google Sheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            <Button
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              variant="outline"
              className="gap-2 w-full sm:w-auto min-h-[2.5rem]"
            >
              {refreshMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {refreshMutation.isPending ? 'Refreshing…' : 'Refresh Now'}
            </Button>

            {refreshFeedback && (
              <Alert
                variant={refreshFeedback.type === 'error' ? 'destructive' : 'default'}
                className="py-2 sm:py-3"
              >
                {refreshFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle className="text-xs sm:text-sm">
                  {refreshFeedback.type === 'success' ? 'Success' : 'Error'}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm break-words">
                  {refreshFeedback.message}
                  {refreshFeedback.type === 'success' && refreshedRowCount !== null && (
                    <span
                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      {refreshedRowCount} rows
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground text-center sm:text-left">
          <span>© {new Date().getFullYear()} Sheet Viewer. All rights reserved.</span>
          <span>
            Built with{' '}
            <span style={{ color: '#16a34a' }}>♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'unknown-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: '#16a34a' }}
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
