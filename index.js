import fetch from 'node-fetch';

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('scope', 'https://graph.microsoft.com/.default');

  const res = await fetch(url, { method:'POST', body: params });
  const json = await res.json();
  if(!json.access_token) throw new Error('No access token: ' + JSON.stringify(json));
  return json.access_token;
}

export default async function (context, req) {
  try {
    const { email, displayName, jobTitle, managerEmail } = req.body || {};
    if(!email || !displayName) return context.res = { status:400, body:{error:'email/displayName required'} };

    const token = await getAccessToken();
    // Create user body
    const userBody = {
      accountEnabled: true,
      displayName,
      mailNickname: email.split('@')[0],
      userPrincipalName: email,
      passwordProfile: {
        forceChangePasswordNextSignIn: true,
        password: 'TempP@ssw0rd!' // generate properly in prod
      },
      jobTitle
    };

    const createRes = await fetch('https://graph.microsoft.com/v1.0/users', {
      method:'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(userBody)
    });

    if(!createRes.ok) {
      const err = await createRes.text();
      context.log('Graph create error', err);
      return context.res = { status: 500, body: { error: err } };
    }

    const createdUser = await createRes.json();

    // Optionally assign manager
    if(managerEmail) {
      // fetch manager user id
      const mgrRes = await fetch(`https://graph.microsoft.com/v1.0/users/${managerEmail}`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      if(mgrRes.ok) {
        const mgr = await mgrRes.json();
        await fetch(`https://graph.microsoft.com/v1.0/users/${createdUser.id}/manager/$ref`, {
          method:'PUT',
          headers:{ Authorization: 'Bearer ' + token, 'Content-Type':'application/json' },
          body: JSON.stringify({ "@odata.id": `https://graph.microsoft.com/v1.0/users/${mgr.id}` })
        });
      }
    }

    context.res = { status:200, body: { id: createdUser.id, userPrincipalName: createdUser.userPrincipalName } };
  } catch (e) {
    context.log('CreateUser error', e);
    context.res = { status: 500, body: { error: e.message } };
  }
}
