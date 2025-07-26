import { Navbar } from "@/components/navbar";

export function CourseNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">课程未找到</h1>
        <p className="text-gray-600">请检查课程链接是否正确</p>
      </div>
    </div>
  );
}