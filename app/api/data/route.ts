import { getSignedInUser } from "@/lib/current-user";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const clean = (v: unknown, max = 4000) => String(v ?? "").trim().slice(0, max);
const url = (v: unknown) => { const value=clean(v,500); if(!value) return ""; try { const parsed=new URL(value); return ["http:","https:"].includes(parsed.protocol)?parsed.toString():""; } catch { return ""; } };
const num = (v: unknown) => Number(v) || 0;
const run = (sql: string, ...args: unknown[]) => getDb().query(sql, args);
const query = async (sql: string, ...args: unknown[]) => (await run(sql, ...args)).rows;
const one = async (sql: string, ...args: unknown[]) => (await query(sql, ...args))[0];
const response = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
const error = (message: string, status = 400) => response({ error: message }, status);

async function notify(userId: string, body: string) {
  await run("INSERT INTO notifications (id,user_id,body,created_at) VALUES ($1,$2,$3,$4)", id(), userId, body, now());
}

export async function GET() {
  const auth = await getSignedInUser();
  if (!auth) return error("Please sign in.", 401);
  const me = await one("SELECT * FROM users WHERE id=$1", auth.userId);
  if (!me) return response({ me: null });
  const designer = me.role === "designer";
  const [people, jobs, proposals, projects, messages, portfolio, invoices, reviews, notifications] = await Promise.all([
    query("SELECT id,role,name,title,bio,location,website,skills,services,experience,starting_price,industry,phone,open_to_proposals,created_at FROM users WHERE id<>$1 ORDER BY created_at DESC", auth.userId),
    designer ? query("SELECT j.*,u.name business_name,u.location business_location FROM jobs j JOIN users u ON u.id=j.business_id WHERE j.status IN ('Open','Reviewing Proposals') ORDER BY j.created_at DESC") : query("SELECT j.*,u.name business_name,u.location business_location FROM jobs j JOIN users u ON u.id=j.business_id WHERE j.business_id=$1 ORDER BY j.created_at DESC", auth.userId),
    designer ? query("SELECT p.*,j.title job_title,j.business_id,u.name designer_name FROM proposals p JOIN jobs j ON j.id=p.job_id JOIN users u ON u.id=p.designer_id WHERE p.designer_id=$1 ORDER BY p.created_at DESC", auth.userId) : query("SELECT p.*,j.title job_title,j.business_id,u.name designer_name FROM proposals p JOIN jobs j ON j.id=p.job_id JOIN users u ON u.id=p.designer_id WHERE j.business_id=$1 ORDER BY p.created_at DESC", auth.userId),
    query(`SELECT p.*,b.name business_name,d.name designer_name FROM projects p JOIN users b ON b.id=p.business_id JOIN users d ON d.id=p.designer_id WHERE ${designer ? "p.designer_id" : "p.business_id"}=$1 ORDER BY p.created_at DESC`, auth.userId),
    query("SELECT m.*,s.name sender_name,r.name recipient_name FROM messages m JOIN users s ON s.id=m.sender_id JOIN users r ON r.id=m.recipient_id WHERE m.sender_id=$1 OR m.recipient_id=$2 ORDER BY m.created_at ASC", auth.userId, auth.userId),
    query("SELECT * FROM portfolio ORDER BY created_at DESC"),
    query(`SELECT i.*,p.title project_title,b.name business_name,d.name designer_name FROM invoices i JOIN projects p ON p.id=i.project_id JOIN users b ON b.id=i.business_id JOIN users d ON d.id=i.designer_id WHERE ${designer ? "i.designer_id" : "i.business_id"}=$1 ORDER BY i.created_at DESC`, auth.userId),
    query("SELECT * FROM reviews ORDER BY created_at DESC"),
    query("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30", auth.userId),
  ]);
  return response({ me, people, jobs, proposals, projects, messages, portfolio, invoices, reviews, notifications });
}

export async function POST(request: Request) {
  const auth = await getSignedInUser();
  if (!auth) return error("Please sign in.", 401);
  const mediaType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") return error("Send JSON data.", 415);
  let body: unknown;
  try { body = await request.json(); } catch { return error("Invalid request."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return error("Invalid request.");
  const data = body as Record<string, unknown>;
  const action = clean(data.action, 40);
  const me = await one("SELECT * FROM users WHERE id=$1", auth.userId);
  if (action === "register") {
    if (me) return error("Account already exists.");
    const role = clean(data.role);
    if (role !== "designer" && role !== "business") return error("Choose a role.");
    const name = clean(data.name, 100);
    if (name.length < 2) return error("Enter your name or business name.");
    const result = await run("INSERT INTO users (id,email,role,name,created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING", auth.userId, auth.email, role, name, now());
    if (!result.rowCount) return error("Account already exists.", 409);
    return response({ ok: true });
  }
  if (!me) return error("Create your account first.", 403);
  const role = String(me.role);
  const userId = auth.userId;
  if (action === "profile") {
    await run("UPDATE users SET name=$1,title=$2,bio=$3,location=$4,website=$5,skills=$6,services=$7,experience=$8,starting_price=$9,industry=$10,phone=$11,open_to_proposals=$12 WHERE id=$13",
      clean(data.name,100), clean(data.title,100), clean(data.bio,1500), clean(data.location,100), url(data.website), clean(data.skills,500), clean(data.services,500), Math.max(0,num(data.experience)), Math.max(0,num(data.startingPrice)), clean(data.industry,100), clean(data.phone,100), Boolean(data.openToProposals), userId);
    return response({ ok: true });
  }
  if (action === "portfolioAdd" && role === "designer") {
    if (!clean(data.title)) return error("Add a project title.");
    await run("INSERT INTO portfolio (id,designer_id,title,description,image,services,client,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", id(),userId,clean(data.title,100),clean(data.description,1000),url(data.image),clean(data.services,300),clean(data.client,100),now());
    return response({ ok:true });
  }
  if (action === "portfolioEdit" && role === "designer") {
    if (!clean(data.title)) return error("Add a project title.");
    const item=await one("SELECT id FROM portfolio WHERE id=$1 AND designer_id=$2",clean(data.id),userId);
    if (!item) return error("Portfolio item not found.",404);
    await run("UPDATE portfolio SET title=$1,description=$2,image=$3,services=$4,client=$5 WHERE id=$6",clean(data.title,100),clean(data.description,1000),url(data.image),clean(data.services,300),clean(data.client,100),item.id);
    return response({ok:true});
  }
  if (action === "portfolioDelete" && role === "designer") {
    await run("DELETE FROM portfolio WHERE id=$1 AND designer_id=$2",clean(data.id),userId);
    return response({ ok:true });
  }
  if (action === "jobAdd" && role === "business") {
    const title=clean(data.title,120), description=clean(data.description,3000), budget=num(data.budget), deadline=clean(data.deadline,30);
    if (title.length<5 || description.length<20 || budget<=0 || !deadline) return error("Add a title, clear brief, budget and deadline.");
    await run("INSERT INTO jobs (id,business_id,title,description,service,skills,budget,deadline,attachment,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",id(),userId,title,description,clean(data.service,100),clean(data.skills,300),budget,deadline,url(data.attachment),"Open",now());
    return response({ ok:true });
  }
  if (action === "jobStatus" && role === "business") {
    const job=await one("SELECT * FROM jobs WHERE id=$1 AND business_id=$2",clean(data.id),userId);
    if (!job) return error("Job not found.",404);
    const status=clean(data.status);
    if (!["Open","Cancelled"].includes(status)) return error("Invalid status.");
    await run("UPDATE jobs SET status=$1 WHERE id=$2",status,job.id);
    return response({ok:true});
  }
  if (action === "proposalAdd" && role === "designer") {
    const job=await one("SELECT * FROM jobs WHERE id=$1 AND status IN ('Open','Reviewing Proposals')",clean(data.jobId));
    if (!job) return error("This job is not open.",404);
    if (await one("SELECT id FROM proposals WHERE job_id=$1 AND designer_id=$2",job.id,userId)) return error("You already proposed on this job.");
    const amount=num(data.amount), days=num(data.deliveryDays), message=clean(data.message,2000);
    if (amount<=0 || days<=0 || message.length<20) return error("Add an amount, delivery time and a detailed message.");
    await run("INSERT INTO proposals (id,job_id,designer_id,amount,delivery_days,message,attachment,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",id(),job.id,userId,amount,days,message,url(data.attachment),now());
    await run("UPDATE jobs SET status='Reviewing Proposals' WHERE id=$1",job.id);
    await run("INSERT INTO messages (id,sender_id,recipient_id,job_id,body,created_at) VALUES ($1,$2,$3,$4,$5,$6)",id(),userId,job.business_id,job.id,`Proposal for ${job.title}: ${message}`,now());
    await notify(String(job.business_id),`${me.name} sent a proposal for ${job.title}.`);
    return response({ok:true});
  }
  if (action === "proposalStatus" && role === "business") {
    const proposal=await one("SELECT p.*,j.business_id,j.title job_title,j.deadline FROM proposals p JOIN jobs j ON j.id=p.job_id WHERE p.id=$1 AND j.business_id=$2",clean(data.id),userId);
    if (!proposal) return error("Proposal not found.",404);
    const status=clean(data.status);
    if (!["Accepted","Declined","Viewed"].includes(status)) return error("Invalid status.");
    if (status==="Accepted") {
      const existing=await one("SELECT id FROM projects WHERE job_id=$1",proposal.job_id);
      if (existing) return error("A designer has already been selected.");
      const projectId=id();
      await run("INSERT INTO projects (id,job_id,business_id,designer_id,title,amount,deadline,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",projectId,proposal.job_id,userId,proposal.designer_id,proposal.job_title,proposal.amount,proposal.deadline,now());
      await run("UPDATE proposals SET status='Accepted' WHERE id=$1",proposal.id);
      await run("UPDATE proposals SET status='Declined' WHERE job_id=$1 AND id<>$2",proposal.job_id,proposal.id);
      await run("UPDATE jobs SET status='Designer Selected' WHERE id=$1",proposal.job_id);
      await notify(String(proposal.designer_id),`Your proposal for ${proposal.job_title} was accepted. Your project is ready.`);
      await run("INSERT INTO messages (id,sender_id,recipient_id,project_id,job_id,body,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",id(),userId,proposal.designer_id,projectId,proposal.job_id,`Great news — I accepted your proposal for ${proposal.job_title}. Let's get started.`,now());
    } else {
      await run("UPDATE proposals SET status=$1 WHERE id=$2 AND status NOT IN ('Accepted','Declined')",status,proposal.id);
      await notify(String(proposal.designer_id),`Your proposal for ${proposal.job_title} was ${status.toLowerCase()}.`);
    }
    return response({ok:true});
  }
  if (action === "proposalWithdraw" && role === "designer") {
    await run("UPDATE proposals SET status='Withdrawn' WHERE id=$1 AND designer_id=$2 AND status IN ('Submitted','Viewed')",clean(data.id),userId);
    return response({ok:true});
  }
  if (action === "directProposal" && role === "designer") {
    const business=await one("SELECT id,name,open_to_proposals FROM users WHERE id=$1 AND role='business'",clean(data.businessId));
    if (!business || Number(business.open_to_proposals)!==1) return error("This business is not open to direct proposals.",403);
    const amount=num(data.amount), days=num(data.deliveryDays), service=clean(data.service,100), pitch=clean(data.message,2000);
    if (amount<=0 || days<=0 || !service || pitch.length<20) return error("Add a service, quotation, delivery time and detailed message.");
    const weekAgo=new Date(Date.now()-7*86400000).toISOString();
    const recent=await one("SELECT id FROM messages WHERE sender_id=$1 AND recipient_id=$2 AND body LIKE 'Direct proposal:%' AND created_at>$3",userId,business.id,weekAgo);
    if (recent) return error("You have already sent this business a proposal this week.");
    const dayAgo=new Date(Date.now()-86400000).toISOString();
    const daily=await one("SELECT COUNT(*) count FROM messages WHERE sender_id=$1 AND body LIKE 'Direct proposal:%' AND created_at>$2",userId,dayAgo);
    if (Number(daily?.count||0)>=3) return error("You can send up to three direct proposals per day.");
    const body=`Direct proposal: ${service}\nQuotation: UGX ${amount.toLocaleString("en-UG")}\nDelivery: ${days} days\n\n${pitch}`;
    await run("INSERT INTO messages (id,sender_id,recipient_id,body,attachment,created_at) VALUES ($1,$2,$3,$4,$5,$6)",id(),userId,business.id,body,url(data.attachment),now());
    await notify(String(business.id),`${me.name} sent you a direct service proposal.`);
    return response({ok:true});
  }
  if (action === "message") {
    const other=await one("SELECT * FROM users WHERE id=$1 AND role<>$2",clean(data.recipientId),role);
    if (!other) return error("Recipient not found.",404);
    const body=clean(data.body,4000);
    if (!body && !url(data.attachment)) return error("Write a message.");
    const connected=role==="business" || !!(await one("SELECT p.id FROM proposals p JOIN jobs j ON j.id=p.job_id WHERE p.designer_id=$1 AND j.business_id=$2 UNION SELECT id FROM projects WHERE designer_id=$3 AND business_id=$4",userId,other.id,userId,other.id));
    const replies=await one("SELECT id FROM messages WHERE sender_id=$1 AND recipient_id=$2 LIMIT 1",other.id,userId);
    const prior=await one("SELECT id FROM messages WHERE sender_id=$1 AND recipient_id=$2 LIMIT 1",userId,other.id);
    const daily=await one("SELECT COUNT(*) count FROM messages WHERE sender_id=$1 AND created_at>$2 AND recipient_id IN (SELECT id FROM users WHERE role='business')",userId,new Date(Date.now()-86400000).toISOString());
    const permitted=connected || (Number(other.open_to_proposals)===1 && (!!replies || (!prior && Number(daily?.count||0)<3)));
    if (!permitted) return error("You can message this business after proposing on a job or if it accepts direct proposals.",403);
    await run("INSERT INTO messages (id,sender_id,recipient_id,body,attachment,created_at) VALUES ($1,$2,$3,$4,$5,$6)",id(),userId,other.id,body,url(data.attachment),now());
    await notify(String(other.id),`New message from ${me.name}.`);
    return response({ok:true});
  }
  if (action === "projectStatus") {
    const project=await one("SELECT * FROM projects WHERE id=$1 AND (designer_id=$2 OR business_id=$3)",clean(data.id),userId,userId);
    if (!project) return error("Project not found.",404);
    const status=clean(data.status);
    if (!["Not Started","In Progress","Awaiting Feedback","Completed","Cancelled"].includes(status)) return error("Invalid status.");
    await run("UPDATE projects SET status=$1 WHERE id=$2",status,project.id);
    await notify(String(project.designer_id===userId?project.business_id:project.designer_id),`${me.name} changed ${project.title} to ${status}.`);
    return response({ok:true});
  }
  if (action === "invoiceAdd" && role === "designer") {
    const project=await one("SELECT * FROM projects WHERE id=$1 AND designer_id=$2",clean(data.projectId),userId);
    if (!project) return error("Project not found.",404);
    const description=clean(data.description,500), quantity=num(data.quantity), unitPrice=num(data.unitPrice), dueDate=clean(data.dueDate,30);
    if (!description || quantity<=0 || unitPrice<=0 || !dueDate) return error("Complete the invoice details.");
    const number=`GB-${Date.now().toString(36).toUpperCase()}`;
    await run("INSERT INTO invoices (id,project_id,designer_id,business_id,number,description,quantity,unit_price,tax,notes,due_date,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",id(),project.id,userId,project.business_id,number,description,quantity,unitPrice,Math.max(0,num(data.tax)),clean(data.notes,500),dueDate,now());
    return response({ok:true});
  }
  if (action === "invoiceStatus") {
    const invoice=await one("SELECT * FROM invoices WHERE id=$1 AND (designer_id=$2 OR business_id=$3)",clean(data.id),userId,userId);
    if (!invoice) return error("Invoice not found.",404);
    const status=clean(data.status);
    const allowed=role==="designer"?["Draft","Sent","Cancelled"]:["Paid","Partially Paid"];
    if (!allowed.includes(status)) return error("Invalid status.");
    await run("UPDATE invoices SET status=$1 WHERE id=$2",status,invoice.id);
    await notify(String(role==="designer"?invoice.business_id:invoice.designer_id),`Invoice ${invoice.number} was marked ${status}.`);
    return response({ok:true});
  }
  if (action === "review") {
    const project=await one("SELECT * FROM projects WHERE id=$1 AND status='Completed' AND (business_id=$2 OR designer_id=$3)",clean(data.projectId),userId,userId);
    if (!project) return error("Complete the project before reviewing.",403);
    if (await one("SELECT id FROM reviews WHERE project_id=$1 AND author_id=$2",project.id,userId)) return error("You already reviewed this project.");
    const rating=num(data.rating), body=clean(data.body,500);
    if (rating<1 || rating>5 || !body) return error("Add a rating and short review.");
    const subject=String(project.business_id===userId?project.designer_id:project.business_id);
    await run("INSERT INTO reviews (id,project_id,author_id,subject_id,rating,body,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",id(),project.id,userId,subject,rating,body,now());
    await notify(subject,`${me.name} reviewed your completed project.`);
    return response({ok:true});
  }
  if (action === "notificationsRead") {
    await run("UPDATE notifications SET read_at=$1 WHERE user_id=$2 AND read_at IS NULL",now(),userId);
    return response({ok:true});
  }
  return error("Action unavailable for this account.",403);
}
