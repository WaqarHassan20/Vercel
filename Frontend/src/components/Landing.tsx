import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useState } from "react"
import axios from "axios"

const BACKEND_UPLOAD_URL = "http://localhost:3000";

export function Landing() {
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#18181b] p-4">
      <Card className="w-full max-w-md bg-[#23232b] border border-[#23232b] shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Deploy your GitHub Repository</CardTitle>
          <CardDescription className="text-gray-400">Enter the URL of your GitHub repository to deploy it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="spa ce-y-2">
              <Label htmlFor="github-url" className="text-gray-300">GitHub Repository URL</Label>
              <Input 
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                }} 
                placeholder="https://github.com/username/repo"
                className="bg-[#23232b] border border-[#35353f] text-white placeholder:text-gray-500"
              />
            </div>
            <Button 
              onClick={async () => {
                setUploading(true);
                const res = await axios.post(`${BACKEND_UPLOAD_URL}/deploy`, {
                  repoUrl: repoUrl
                });
                setUploadId(res.data.id);
                setUploading(false);
                const interval = setInterval(async () => {
                  const response = await axios.get(`${BACKEND_UPLOAD_URL}/status?id=${res.data.id}`);
                  if (response.data.status === "deployed") {
                    clearInterval(interval);
                    setDeployed(true);
                  }
                }, 3000)
              }} 
              disabled={uploadId !== "" || uploading} 
              className="w-full bg-[#35353f] text-white font-bold shadow hover:bg-[#44444f] transition"
              type="submit"
            >
              {uploadId ? `Deploying (${uploadId})` : uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {deployed && <Card className="w-full max-w-md mt-8 bg-[#23232b] border border-[#23232b] shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Deployment Status</CardTitle>
          <CardDescription className="text-gray-400">Your website is successfully deployed!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="deployed-url" className="text-gray-300">Deployed URL</Label>
            <Input 
              id="deployed-url" 
              readOnly 
              type="url" 
              value={`http://${uploadId}.vercel.local:3001`}
              className="bg-[#23232b] border border-[#35353f] text-white"
            />
          </div>
          <br />
          <Button className="w-full bg-[#35353f] text-white font-bold shadow hover:bg-[#44444f] transition" variant="outline">
            <a href={`http://${uploadId}.vercel.local:3001/`} target="_blank">
              Visit Website
            </a>
          </Button>
        </CardContent>
      </Card>}
    </main>
  )
}