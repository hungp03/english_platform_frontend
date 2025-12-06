'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, ExternalLink, X, Clock } from 'lucide-react'
import { listMyAttempts, getAttemptAnswers, getSpeakingSubmissions, getWritingSubmissions } from '@/lib/api/attempt'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AttemptAnswersView from '@/components/assessment/attempt-answers-view'
import AssessmentPolling from '@/components/practice/assessment-polling'

function fmtDate(iso) {
  if (!iso) return ''
  try { 
    return new Date(iso).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch { 
    return String(iso) 
  }
}

function pct(score, max) {
  const s = Number(score ?? 0), m = Number(max ?? 0)
  if (!m) return '0%'
  return Math.round((s / m) * 100) + '%'
}

function getStatusColor(status) {
  switch(status) {
    case 'AUTO_GRADED': return 'border-green-500 text-green-700'
    case 'STARTED': return 'border-yellow-500 text-yellow-700'
    case 'PENDING_REVIEW': return 'border-blue-500 text-blue-700'
    default: return 'border-gray-500 text-gray-700'
  }
}

function formatStatus(status) {
  const map = {
    'AUTO_GRADED': 'Đã chấm',
    'STARTED': 'Đang làm',
    'PENDING_REVIEW': 'Chờ chấm',
    'SUBMITTED': 'Đã nộp'
  }
  return map[status] || status
}

export default function TestHistory() {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [attemptData, setAttemptData] = useState(null)
  const [attemptLoading, setAttemptLoading] = useState(false)
  const [assessmentResults, setAssessmentResults] = useState([])
  const [assessmentMetadata, setAssessmentMetadata] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const [currentAttemptInfo, setCurrentAttemptInfo] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    ;(async () => {
      try {
        const res = await listMyAttempts({ page, size: 10 })
        if (!mounted) return
        
        if (res.success) {
          const attempts = res.data?.result || []
          setRows(attempts)
          setMeta(res.data?.meta || null)
        } else {
          console.error('Fetch attempts failed:', res.error)
          setRows([])
          setMeta(null)
        }
      } catch (e) {
        console.error('Fetch attempts failed', e)
        if (mounted) {
          setRows([])
          setMeta(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    
    return () => { mounted = false }
  }, [page])

  const handleViewAttempt = async (attemptId, skill) => {
    setDialogOpen(true)
    setAttemptLoading(true)
    setAttemptData(null)
    setAssessmentResults([])
    setAssessmentMetadata(null)
    setCurrentAttemptInfo({ attemptId, skill })
    
    try {
      const skillUpper = skill?.toUpperCase()
      
      if (skillUpper === 'WRITING' || skillUpper === 'SPEAKING') {
        setIsPolling(true)
        const { results, metadata } = await fetchAssessmentResults(attemptId, skillUpper)
        setAssessmentResults(results)
        setAssessmentMetadata(metadata)
        setIsPolling(false)
      } else {
        const res = await getAttemptAnswers(attemptId)
        if (res.success) {
          setAttemptData(res.data)
        }
      }
    } catch (e) {
      console.error('Load attempt failed', e)
    } finally {
      setAttemptLoading(false)
    }
  }

  const handleRetrySuccess = async () => {
    if (!currentAttemptInfo) return
    
    const { attemptId, skill } = currentAttemptInfo
    const skillUpper = skill?.toUpperCase()
    
    if (skillUpper === 'WRITING' || skillUpper === 'SPEAKING') {
      setIsPolling(true)
      const { results, metadata } = await fetchAssessmentResults(attemptId, skillUpper)
      setAssessmentResults(results)
      setAssessmentMetadata(metadata)
      setIsPolling(false)
    }
  }

  const fetchAssessmentResults = async (attemptId, skill) => {
    try {
      const res = skill === 'SPEAKING' 
        ? await getSpeakingSubmissions(attemptId)
        : await getWritingSubmissions(attemptId)
      
      if (res.success && res.data) {
        const { submissions, ...metadata } = res.data
        return {
          results: (submissions || []).map(sub => ({
            ...sub,
            type: skill.toLowerCase()
          })),
          metadata
        }
      }
    } catch (err) {
      console.error('Fetch assessment error:', err)
    }
    return { results: [], metadata: null }
  }

  // Group attempts by quizId with data from API
  const grouped = useMemo(() => {
    const byQuiz = {}
    
    // Group by quizId
    for (const a of rows) {
      const qid = a.quizId
      if (!byQuiz[qid]) {
        byQuiz[qid] = {
          quizId: qid,
          examName: a.quizName || `Quiz ${qid?.slice(0, 8)}...`,
          skill: a.skill,
          quizTypeName: a.quizType,
          quizSectionName: a.quizSection,
          attempts: []
        }
      }
      byQuiz[qid].attempts.push(a)
    }
    
    // Convert to array and sort attempts within each group
    return Object.values(byQuiz)
      .map(group => ({
        ...group,
        attempts: group.attempts.sort((x, y) => {
          const dateX = new Date(x.submittedAt || x.startedAt || 0)
          const dateY = new Date(y.submittedAt || y.startedAt || 0)
          return dateY - dateX
        })
      }))
      .sort((a, b) => {
        const latestA = new Date(a.attempts[0]?.submittedAt || a.attempts[0]?.startedAt || 0)
        const latestB = new Date(b.attempts[0]?.submittedAt || b.attempts[0]?.startedAt || 0)
        return latestB - latestA
      })
  }, [rows])

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Lịch sử làm bài</h2>
        <p className="text-sm text-muted-foreground">
          Hiển thị mọi bài bạn đã nộp. Nhấn vào quiz để làm lại.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20 rounded" />
                      <Skeleton className="h-6 w-24 rounded" />
                      <Skeleton className="h-6 w-28 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {[...Array(2)].map((_, j) => (
                    <li key={j} className="py-4 first:pt-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-16 rounded" />
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-5 w-12 rounded" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Chưa có lịch sử làm bài.</p>
            <Button variant="link" asChild className="mt-4">
              <Link href="/mock-tests">
                Bắt đầu làm bài →
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <Card key={group.quizId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{group.examName}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {group.quizTypeName && (
                        <Badge variant="secondary">{group.quizTypeName}</Badge>
                      )}
                      {group.skill && (
                        <Badge variant="outline">{group.skill}</Badge>
                      )}
                      {group.quizSectionName && (
                        <Badge variant="outline">{group.quizSectionName}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button asChild size="sm">
                    <Link href={`/practice/${group.quizId}`}>
                      Làm lại 
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="divide-y">
                  {group.attempts.map(a => (
                    <li key={a.id} className="py-4 first:pt-0 hover:bg-muted/50 -mx-6 px-6 transition-colors">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {fmtDate(a.submittedAt || a.startedAt)}
                          </span>
                          <Badge variant="outline" className={getStatusColor(a.status)}>
                            {formatStatus(a.status)}
                          </Badge>
                        </div>
                        
                        {a.skill !== 'WRITING' && a.skill !== 'SPEAKING' && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">
                              {a.totalCorrect ?? 0}/{a.totalQuestions ?? 0}
                            </span>
                            <Badge variant="secondary">
                              {pct(a.score, a.maxScore)}
                            </Badge>
                          </div>
                        )}
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => handleViewAttempt(a.id, a.skill)}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && meta.pages > 1 && (
        <div className="flex justify-center pt-6">
          <Pagination
            totalPages={meta.pages}
            currentPage={page - 1}
            onPageChange={(p0) => setPage(p0 + 1)}
            siblingCount={1}
          />
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ width: '85vw', maxWidth: '85vw' }}>
          <DialogHeader>
            <DialogTitle>Chi tiết bài làm</DialogTitle>
          </DialogHeader>
          
          {attemptLoading ? (
            <div className="space-y-4 py-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : assessmentResults.length > 0 ? (
            <div className="space-y-6">
              {assessmentMetadata && (
                <Card>
                  <CardHeader>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{assessmentMetadata.quizName}</CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{assessmentMetadata.quizType}</span>
                        <span>•</span>
                        <span>{assessmentMetadata.quizSection}</span>
                        <span>•</span>
                        <span>{assessmentMetadata.skill}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Bắt đầu: {fmtDate(assessmentMetadata.startedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Nộp bài: {fmtDate(assessmentMetadata.submittedAt)}</span>
                      </div>
                      <Badge variant="outline">{formatStatus(assessmentMetadata.status)}</Badge>
                    </div>
                    {assessmentMetadata.contextText && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: assessmentMetadata.contextText }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              <AssessmentPolling
                isPolling={isPolling}
                allResults={assessmentResults}
                assessmentError={null}
                attemptId={null}
                onViewDetails={() => {}}
                onRetrySuccess={handleRetrySuccess}
              />
            </div>
          ) : attemptData ? (
            <AttemptAnswersView data={attemptData} />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
