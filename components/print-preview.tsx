"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Eye, EyeOff } from "lucide-react"
import type { Student } from "@/app/page"
import { WordExport } from "@/components/word-export"

interface PrintPreviewProps {
  student: Student
}

export function PrintPreview({ student }: PrintPreviewProps) {
  const [showPreview, setShowPreview] = useState(true)

  const handlePrint = () => {
    window.print()
  }

  const getGradeLevel = (template: string) => {
    switch (template) {
      case "G9-G12":
        return "Grades 9-12"
      case "G10-G12":
        return "Grades 10-12"
      case "G11-G12":
        return "Grades 11-12"
      case "G12":
        return "Grade 12"
      default:
        return template
    }
  }

  const getOverallAverage = () => {
    const validGrades = student.grades.filter((g) => g.average > 0)
    if (validGrades.length === 0) return 0
    return Math.round(validGrades.reduce((acc, g) => acc + g.average, 0) / validGrades.length)
  }

  const getGradeStatus = (average: number) => {
    if (average >= 90) return "Excellent"
    if (average >= 80) return "Good"
    if (average >= 70) return "Satisfactory"
    if (average >= 60) return "Pass"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transcript Preview & Export</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print Transcript
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Preview your transcript before printing or exporting. The layout is optimized for standard letter-size paper
            in landscape orientation.
          </div>
        </CardContent>
      </Card>

      {/* Word Export Component */}
      <WordExport student={student} />

      {/* Print Preview */}
      {showPreview && (
        <div className="print-container">
          <div className="transcript-page bg-white text-black p-8 shadow-lg mx-auto" style={{ width: "11in" }}>
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold mb-2">OFFICIAL TRANSCRIPT</h1>
              <div className="text-lg">Academic Record</div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-1">STUDENT INFORMATION</h2>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-semibold w-32">Name:</span>
                    <span className="font-bold text-lg">{student.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Gender:</span>
                    <span>{student.gender}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Age:</span>
                    <span>{student.age}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Academic Year:</span>
                    <span>{student.academicYears}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Program:</span>
                    <span>{getGradeLevel(student.template)}</span>
                  </div>
                </div>
              </div>

              {/* Photo Placeholder */}
              <div className="flex justify-end">
                <div className="w-32 h-40 border-2 border-gray-400 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-300"></div>
                    <div className="text-xs">Student Photo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Record */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-1">ACADEMIC RECORD</h2>

              {student.grades.length > 0 ? (
                <table className="w-full border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-3 text-left font-bold">SUBJECT</th>
                      <th className="border border-black p-3 text-center font-bold">SEMESTER 1</th>
                      <th className="border border-black p-3 text-center font-bold">SEMESTER 2</th>
                      <th className="border border-black p-3 text-center font-bold">AVERAGE</th>
                      <th className="border border-black p-3 text-center font-bold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.grades.map((grade, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-black p-3 font-medium">{grade.subject}</td>
                        <td className="border border-black p-3 text-center font-mono">
                          {grade.semester1 > 0 ? `${grade.semester1}%` : "-"}
                        </td>
                        <td className="border border-black p-3 text-center font-mono">
                          {grade.semester2 > 0 ? `${grade.semester2}%` : "-"}
                        </td>
                        <td className="border border-black p-3 text-center font-mono font-bold">
                          {grade.average > 0 ? `${grade.average}%` : "-"}
                        </td>
                        <td className="border border-black p-3 text-center text-sm">
                          {grade.average > 0 ? getGradeStatus(grade.average) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">No grades recorded</div>
              )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">ACADEMIC SUMMARY</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Subjects:</span>
                    <span className="font-mono">{student.grades.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Overall Average:</span>
                    <span className="font-mono font-bold text-lg">{getOverallAverage()}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Academic Status:</span>
                    <span className="font-bold">{getGradeStatus(getOverallAverage())}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 border-b border-gray-400 pb-1">GRADE DISTRIBUTION</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>A Grades (90%+):</span>
                    <span className="font-mono">{student.grades.filter((g) => g.average >= 90).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>B Grades (80-89%):</span>
                    <span className="font-mono">
                      {student.grades.filter((g) => g.average >= 80 && g.average < 90).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>C Grades (70-79%):</span>
                    <span className="font-mono">
                      {student.grades.filter((g) => g.average >= 70 && g.average < 80).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>D Grades (60-69%):</span>
                    <span className="font-mono">
                      {student.grades.filter((g) => g.average >= 60 && g.average < 70).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-4 mt-8">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-gray-600">Generated on:</div>
                  <div className="font-mono">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-black w-48 mb-2"></div>
                  <div className="text-sm">Authorized Signature</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Document ID:</div>
                  <div className="font-mono text-xs">{student.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .transcript-page,
          .transcript-page * {
            visibility: visible;
          }
          .transcript-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0.5in !important;
            box-shadow: none !important;
          }
          @page {
            size: landscape;
            margin: 0.5in;
          }
        }
        .print-container {
          overflow-x: auto;
        }
        .transcript-page {
          min-height: 8.5in;
          font-family: "Times New Roman", serif;
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}
