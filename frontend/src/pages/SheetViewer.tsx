import { useMemo, useState } from 'react';
import { TableIcon, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useFetchGoogleSheet, useIsValid } from '@/hooks/useQueries';
import { parseCSV } from '@/lib/csvParser';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function SheetViewer() {
  const { data: isValid, isLoading: isValidLoading } = useIsValid();
  const {
    data: csvData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useFetchGoogleSheet();

  const [activeRow, setActiveRow] = useState<number | null>(null);

  const { headers, rows } = useMemo(() => {
    if (!csvData) return { headers: [], rows: [] };
    return parseCSV(csvData);
  }, [csvData]);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const getRowStyle = (rowIdx: number, isActive: boolean) => {
    if (isActive) {
      return { backgroundColor: '#dcfce7' };
    }
    return { backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f0faf3' };
  };

  const getFirstCellStyle = (isActive: boolean) => ({
    borderLeftWidth: '4px',
    borderLeftColor: isActive ? '#16a34a' : 'transparent',
    borderLeftStyle: 'solid' as const,
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0faf3' }}>
      {/* Header */}
      <header className="border-b border-border bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 h-auto min-h-[4rem] flex flex-wrap items-center justify-between gap-2 py-2 sm:py-0 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div
              className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl shrink-0"
              style={{ backgroundColor: '#16a34a' }}
            >
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-foreground leading-tight font-display tracking-tight truncate">
                Sheet Viewer
              </h1>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Updated {lastUpdated}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {rows.length > 0 && (
              <span
                className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold text-white"
                style={{ backgroundColor: '#16a34a' }}
              >
                {rows.length} {rows.length === 1 ? 'row' : 'rows'}
              </span>
            )}
            <Button
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5 font-semibold text-xs sm:text-sm px-2 sm:px-3"
              style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Loading state */}
        {(isLoading || isValidLoading) && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="rounded-xl border border-border overflow-hidden shadow-md bg-white">
              <div className="p-3 flex gap-4" style={{ backgroundColor: '#1a5c38' }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1 bg-white/20" />
                ))}
              </div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`p-3 flex gap-4 border-t border-border ${i % 2 === 0 ? 'bg-white' : ''}`}
                  style={i % 2 !== 0 ? { backgroundColor: '#f0faf3' } : {}}
                >
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not configured state */}
        {!isLoading && !isValidLoading && isValid === false && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-6 animate-fade-in px-4">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <FileSpreadsheet className="w-8 h-8" style={{ color: '#16a34a' }} />
            </div>
            <div className="text-center max-w-sm">
              <h2 className="text-xl font-semibold text-foreground mb-2 font-display">
                No Sheet Configured
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This viewer hasn't been set up yet. An administrator needs to configure a Google Sheets CSV export URL to display data here.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load data</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Unable to fetch sheet data. Please try refreshing.'}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3 block"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty data state */}
        {!isLoading && !isError && isValid && headers.length === 0 && csvData !== undefined && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 animate-fade-in px-4">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <TableIcon className="w-7 h-7" style={{ color: '#16a34a' }} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-1 font-display">No Data Found</h2>
              <p className="text-muted-foreground text-sm">
                The sheet appears to be empty or the data couldn't be parsed.
              </p>
            </div>
          </div>
        )}

        {/* Data table */}
        {!isLoading && !isError && headers.length > 0 && (
          <div className="animate-fade-in">
            {/* Summary line */}
            <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-2.5">
              <div
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0"
                style={{ backgroundColor: '#16a34a' }}
              >
                <TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                {headers.length} columns · {rows.length} {rows.length === 1 ? 'row' : 'rows'}
              </span>
            </div>

            {/* Table card — horizontally scrollable */}
            <div className="rounded-xl border border-border shadow-md overflow-hidden bg-white">
              <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
                <table className="w-full text-sm border-collapse" style={{ minWidth: 'max-content' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a5c38' }}>
                      <th
                        className="w-8 sm:w-10 px-2 sm:px-3 py-2.5 sm:py-3.5 text-left text-xs font-bold text-white border-r select-none tracking-widest uppercase"
                        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                      >
                        #
                      </th>
                      {headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-left text-xs font-bold text-white border-r last:border-r-0 whitespace-nowrap tracking-widest uppercase"
                          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                        >
                          {header || <span className="opacity-50 italic normal-case">Column {i + 1}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => {
                      const isActive = activeRow === rowIdx;
                      return (
                        <tr
                          key={rowIdx}
                          className="border-t border-border transition-all duration-150 cursor-pointer"
                          style={getRowStyle(rowIdx, isActive)}
                          onClick={() => setActiveRow(isActive ? null : rowIdx)}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#dcfce7';
                            const firstTd = e.currentTarget.querySelector('td') as HTMLTableCellElement | null;
                            if (firstTd) firstTd.style.borderLeftColor = '#16a34a';
                          }}
                          onMouseLeave={e => {
                            if (activeRow !== rowIdx) {
                              (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                                rowIdx % 2 === 0 ? '#ffffff' : '#f0faf3';
                              const firstTd = e.currentTarget.querySelector('td') as HTMLTableCellElement | null;
                              if (firstTd) firstTd.style.borderLeftColor = 'transparent';
                            }
                          }}
                        >
                          <td
                            className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs text-muted-foreground border-r border-border font-mono select-none"
                            style={getFirstCellStyle(isActive)}
                          >
                            {rowIdx + 1}
                          </td>
                          {headers.map((_, colIdx) => (
                            <td
                              key={colIdx}
                              className="px-3 sm:px-4 py-2 sm:py-2.5 text-foreground border-r border-border last:border-r-0 whitespace-nowrap max-w-[12rem] sm:max-w-xs truncate"
                              title={row[colIdx] || ''}
                            >
                              {row[colIdx] ?? ''}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-2 sm:mt-3 text-xs text-muted-foreground text-right font-medium">
              Showing all {rows.length} {rows.length === 1 ? 'row' : 'rows'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-auto">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground text-center sm:text-left">
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
